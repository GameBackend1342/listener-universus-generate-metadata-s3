/* import * as Sentry from '@sentry/serverless'; */
import * as Sentry from '@sentry/serverless';
import * as AWS from 'aws-sdk';
import s3Services from './services/s3';

/* `Sentry.AWSLambda.init()` initializes the Sentry SDK for AWS Lambda. It takes an object with
configuration options as its argument. In this case, it sets the DSN (Data Source Name) to the value
of the `SENTRY_DSN` environment variable and sets the traces sample rate to 1.0, meaning that all
traces will be captured. This allows for monitoring and error tracking of the Lambda function using
Sentry. */
Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.ENVIRONMENT,
});

/* `AWS.config.update({ region: 'us-east-1' });` is setting the AWS region to 'us-east-1'. This is
necessary for AWS SDK services to know which region to operate in. */
AWS.config.update({ region: 'us-east-1' });

/**
 * Generates metadata for an NFT and saves it to S3 buckets along with its art.
 * @param {Array<any>} event - An array of NFT payloads.
 * @param {Object} context - An optional AWS Lambda context object.
 * @returns {Promise<Object>} - An object with a status code, headers, and a body containing a success message and the NFTs.
 * @throws {Error} - An error is thrown if there is an issue with the S3 SDK or copying the art to the S3 buckets.
 */
export async function GenerateMetadata(event: any = { body: [] }, context: any = {}): Promise<unknown> {
    context.callbackWaitsForEmptyEventLoop = false;

    /* `const { copy, getBucket, putObject } = s3Services(AWS);` is importing and destructuring three
    functions (`copy`, `getBucket`, and `putObject`) from the `s3Services` module and passing the
    `AWS` object as an argument to it. The `s3Services` module likely contains functions that
    interact with AWS S3 buckets, and passing the `AWS` object as an argument allows those functions
    to use the AWS SDK to interact with S3. The destructured functions can then be used within the
    `GenerateMetadata` function to perform S3 operations such as copying files and putting objects. */
    const { copy, getBucket, putObject } = s3Services(AWS);

    /**
     * Asynchronously creates an NFT metadata file and copies associated artwork to an S3 bucket.
     *
     * @param {object} payloadNft The NFT metadata and associated bucket information.
     * @param {string} payloadNft.buckets.s3KeyDefault The S3 key for the default bucket.
     * @param {string} payloadNft.buckets.s3BucketDefault The name of the default S3 bucket.
     * @param {string} payloadNft.buckets.bucketArt The name of the bucket containing artwork.
     * @param {string} payloadNft.buckets.bucketArtSrc The source of the artwork within `bucketArt`.
     * @param {string} payloadNft.buckets.keyArtSrc The source of the artwork within `bucketArtSrc`.
     * @param {string} payloadNft.buckets.s3GifCopyKey The S3 key for copying GIF artwork.
     * @param {string} payloadNft.buckets.s3GlbCopyKey The S3 key for copying GLB artwork.
     * @param {string} payloadNft.buckets.keyArtGlbSrc The source of the GLB artwork within `bucketArtSrc`.
     *
     * @returns {Promise<object>} The NFT metadata.
     * @throws {Error} If the default bucket already contains a metadata file with the same name as the new one.
     * @throws {Error} If there was an error with S3 API requests.
     */
    const iterateEvents = async (payloadNft: any) => {
        console.log(payloadNft);
        /* This code is destructuring the `buckets` object from the `payloadNft` parameter and
        assigning its properties to individual variables with the same names. This allows for easier
        access to the properties within the `iterateEvents` function without having to reference the
        `payloadNft.buckets` object each time. */
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

            /* This code is checking if a metadata file with the same name as the new one already
            exists in the default S3 bucket. If it does, it returns an error message indicating that
            the user is trying to overwrite an existing file. The `head?.Body` syntax is using
            optional chaining to check if the `Body` property exists on the `head` object before
            attempting to access it. If it does not exist, the condition will evaluate to `false`
            and the code inside the `if` block will not be executed. */
            if (head?.Body) {
                return new Error(
                    `${payloadNft.nft.nftType}/${payloadNft.nft.tokenId}.json já existe no bucket s3, voce esta tentando sobescrever`,
                );
            }
        } catch (err) {
            /* This code block is checking if the error message returned by the `getBucket` function
            includes the string `'NoSuchKey'`. If it does not include this string, it means that
            there was an error with the S3 API request that is not related to the key not existing
            in the bucket. In this case, the function throws a new error with the original error
            message. If the error message does include `'NoSuchKey'`, it means that the key does not
            exist in the bucket, and the function continues without throwing an error. */
            /* if (!err.message.includes('NoSuchKey')) {
                return new Error(err);
            } */
        }

        const payload = JSON.stringify(payloadNft.openseaAttributes);
        console.log('Payload do bucket: ', payload);

        try {
            // Cria o metadado do nft em JSON
            /* `await putObject(s3KeyDefault, s3BucketDefault, payload)` is uploading the NFT metadata
            file to the default S3 bucket specified in the `s3BucketDefault` variable with the key
            specified in the `s3KeyDefault` variable. */
            await putObject(s3KeyDefault, s3BucketDefault, payload);
            console.log('Saved: ', {
                s3KeyDefault,
                s3BucketDefault,
                payload,
            });

            // Copia a arte GIF para o tokenId criado
            /* This code is copying an artwork file from one S3 bucket to another. The `copy` function
            is being called with three arguments: the source bucket (`bucketArt`), the source key
            (`bucketArtSrc + keyArtSrc`), and the destination key (`s3GifCopyKey`). The
            `console.log` statement is logging an object with information about the copy operation,
            including the source bucket, source key, and destination key. */
            await copy(bucketArt, bucketArtSrc + '/' + keyArtSrc, s3GifCopyKey);
            console.log('Saved: ', {
                bucketArt,
                key: bucketArtSrc + keyArtSrc,
                dist: s3GifCopyKey,
            });

            // Copia a arte GLB para o tokenId criado
            /* This code is copying an artwork file from one S3 bucket to another. The `copy` function
            is being called with three arguments: the source bucket (`bucketArt`), the source key
            (`bucketArtSrc + keyArtGlbSrc`), and the destination key (`s3GlbCopyKey`). The
            `console.log` statement is logging an object with information about the copy operation,
            including the source bucket, source key, and destination key. */
            await copy(bucketArt, bucketArtSrc + '/' + keyArtGlbSrc, s3GlbCopyKey);
            console.log('Saved: ', {
                bucketArt,
                key: bucketArtSrc + keyArtGlbSrc,
                dist: s3GlbCopyKey,
            });

            return payloadNft.nft;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    };

    const promises = event?.body?.map(iterateEvents);

    const res = await Promise.all(promises);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'Success', res },
    };
}

export default Sentry.AWSLambda.wrapHandler(GenerateMetadata);
