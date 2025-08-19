import { S3Client } from '@aws-sdk/client-s3';
import { SESClient, } from '@aws-sdk/client-ses';
import { decrypt } from './helpers';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string
const region = process.env.Region

// export const s3Client = new S3Client({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey
//   }
// });

// export const sesClient = new SESClient({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey
//   },
// });

// Usage with AWS clients
export const getS3Client = async () => {
  const decryptedAccessKeyId: any = decrypt(AWS_ACCESS_KEY_ID);
  const decryptedSecretAccessKey: any = decrypt(AWS_SECRET_ACCESS_KEY);
  return new S3Client({
    region,
    credentials: {
      accessKeyId: decryptedAccessKeyId,
      secretAccessKey: decryptedSecretAccessKey
    }
  });
};

// Similar for SES client
export const getSESClient = async () => {
  const decryptedAccessKeyId: any = decrypt(AWS_ACCESS_KEY_ID);
  const decryptedSecretAccessKey: any = decrypt(AWS_SECRET_ACCESS_KEY);

  return new SESClient({
    region,
    credentials: {
      accessKeyId: decryptedAccessKeyId,
      secretAccessKey: decryptedSecretAccessKey
    }
  });
};
