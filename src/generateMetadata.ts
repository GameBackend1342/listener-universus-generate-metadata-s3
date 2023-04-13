/* import * as Sentry from '@sentry/serverless'; */
import * as AWS from 'aws-sdk';
import s3Services from './services/s3';

const sqs = new AWS.SQS({ apiVersion: '2012-11-05', region: 'us-east-1' });

/* Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
}); */

// Set the Region
AWS.config.update({ region: 'us-east-1' });

export async function GenerateMetadata(event: any, context: any = {}): Promise<unknown> {
    context.callbackWaitsForEmptyEventLoop = false;
    // Pega os comandos de iteracao com S3 SDK
    const { copy, getBucket, putObject } = s3Services(AWS);

    const iterateEvents = async (payloadNft: any) => {
        console.log(payloadNft);
        // Pega os atributos relacionados a S3 relacionados ao NFT
        const {
            s3KeyDefault,
            s3BucketDefault,
            bucketArt,
            bucketArtSrc,
            keyArtSrc,
            s3GifCopyKey,
            s3GlbCopyKey,
            keyArtGlbSrc,
        } = payloadNft.buckets;

        console.log({
            s3KeyDefault,
            s3BucketDefault,
            bucketArt,
            bucketArtSrc,
            keyArtSrc,
            s3GifCopyKey,
            s3GlbCopyKey,
            keyArtGlbSrc,
        });

        try {
            // Verifica se o bucket existe no S3, caso exista, ira retornar uma mensagem de error
            console.log('Get do bucket: ', s3KeyDefault, s3BucketDefault);
            const head = await getBucket(s3KeyDefault, s3BucketDefault);

            if (head?.Body) {
                return new Error(
                    `${payloadNft.nft.nftType}/${payloadNft.nft.tokenId}.json já existe no bucket s3, voce esta tentando sobescrever`,
                );
            }
        } catch (err) {
            if (!err.message.includes('NoSuchKey')) {
                return new Error(err);
            }
        }

        const payload = JSON.stringify(payloadNft.openseaAttributes);
        console.log('Payload do bucket: ', payload);

        try {
            // Cria o metadado do nft em JSON
            await putObject(s3KeyDefault, s3BucketDefault, payload);
            console.log('Saved: ', {
                s3KeyDefault,
                s3BucketDefault,
                payload,
            });

            // Copia a arte GIF para o tokenId criado
            await copy(bucketArt, bucketArtSrc + keyArtSrc, s3GifCopyKey);
            console.log('Saved: ', {
                bucketArt,
                key: bucketArtSrc + keyArtSrc,
                dist: s3GifCopyKey,
            });

            // Copia a arte GLB para o tokenId criado
            await copy(bucketArt, bucketArtSrc + keyArtGlbSrc, s3GlbCopyKey);
            console.log('Saved: ', {
                bucketArt,
                key: bucketArtSrc + keyArtGlbSrc,
                dist: s3GlbCopyKey,
            });

            /* // Envia a notificacao do mint para a lambda de notificacao
            const paramsSQS: any = {
                // Remove DelaySeconds parameter and value for FIFO queues
                DelaySeconds: 1,
                MessageAttributes: {},
                MessageBody: JSON.stringify({
                    metamask: payloadNft.nft.wallet,
                    nftType: payloadNft.nft.nftType,
                    tokenId: payloadNft.nft.tokenId,
                }),
                QueueUrl: process.env.SQS_URL_NOTIFICATION,
            };

            console.log('Enviando sqs params: ', paramsSQS);

            sqs.sendMessage(paramsSQS, function (err, data) {
                if (err) {
                    console.log('SQS Error', err);
                } else {
                    console.log('SQS Success', data.MessageId);
                }
            }); */

            return payloadNft.nft;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    };

    const promises = event.map(iterateEvents);

    const res = await Promise.all(promises);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Success', res },
    };
}

//export default Sentry.AWSLambda.wrapHandler(GenerateMetadata);
export default GenerateMetadata;
