import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sanitazeS3Key } from './utils';

export default function (AWS: any) {
    const s3Client = new S3Client({ region: 'us-east-1' });
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

    const getBucket = async (key: string, bucket: string) => {
        const params = {
            Key: sanitazeS3Key(key),
            Bucket: bucket,
        };

        return s3
            .getObject(params)
            .promise()
            .catch((error: any) => {
                throw new Error(error);
            });
    };

    const putObject = async (key: string, bucket: string, body: any) => {
        const params = {
            Key: sanitazeS3Key(key),
            Bucket: bucket,
            Body: body,
            ContentType: 'application/json',
        };

        return s3
            .putObject(params)
            .promise()
            .catch((error: any) => {
                throw new Error(error);
            });
    };

    const copy = async (bucket: string, sourceCopy: string, dist: string) => {
        const paramsArtSrc = {
            Bucket: bucket,
            CopySource: sanitazeS3Key(sourceCopy),
            Key: sanitazeS3Key(dist),
        };

        console.log('S3 Copy: ', paramsArtSrc);

        return s3Client.send(new CopyObjectCommand(paramsArtSrc)).catch((error: any) => {
            throw new Error(error);
        });
    };

    return { getBucket, putObject, copy };
}
