import { MINIO_CONFIG } from "@app/shared";
import { Inject, Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import mimetype from "mime-types";
import { Client } from "minio";
import { RedisCacheService } from "../redis";

@Injectable()
export class MinioService implements OnModuleInit {
  @Inject()
  redisCache: RedisCacheService;

  private logger = new Logger(MinioService.name);
  private _client: Client;
  private _isConnected = false;

  async onModuleInit() {
    // connect to minio
    await this.connect();
  }

  // connect to minio
  async connect() {
    try {
      // set endpoint url
      const url = new URL(MINIO_CONFIG.endpoint);
      // initialize minio client object.
      this._client = new Client({
        endPoint: url.host,
        port: Number(MINIO_CONFIG.port),
        useSSL: url.protocol === "https:",
        accessKey: MINIO_CONFIG.accessKey,
        secretKey: MINIO_CONFIG.secretKey,
      });

      // check connection
      this._client.bucketExists(MINIO_CONFIG.bucket, (err) => {
        if (err) {
          this.logger.error(`Minio connection error: ${err.message}`, err.stack);
          this._isConnected = false;
        } else {
          this.logger.log(`Minio connected`);
          this._isConnected = true;
        }
      });

      // enable policy for bucket
      this.setupBucketPolicy(MINIO_CONFIG.bucket);
    } catch (error) {
      throw new InternalServerErrorException(`Minio init error: ${error.message}`, error.stack);
    }
  }

  // get connection status
  get isConnected() {
    return this._isConnected;
  }

  // get client object of minio
  get client() {
    return this._client;
  }

  // get bucket name
  get bucket() {
    return MINIO_CONFIG.bucket;
  }

  // get endpoint url
  get endpoint() {
    return MINIO_CONFIG.endpoint;
  }

  // setup bucket policy with type of connector
  private setupBucketPolicy(bucketName: string) {
    // get connector
    const connector = this.getConnector(MINIO_CONFIG.endpoint);

    // setup bucket policy
    if (connector == "aws") {
      return this.setupBucketPolicyAWS(bucketName);
    } else if (connector == "google") {
      return this.setupBucketPolicyGoogle(bucketName);
    } else {
      return this.setupBucketPolicyMinio(bucketName);
    }
  }

  // setup bucket policy for google cloud storage
  private setupBucketPolicyGoogle(bucketName: string) {
    // make allow public read for folder /images
    throw new Error("Not implemented");
  }

  // setup bucket policy for minio storage
  private setupBucketPolicyMinio(bucketName: string) {
    return this.setupBucketPolicyAWS(bucketName);
  }

  // setup bucket policy for aws storage
  private setupBucketPolicyAWS(bucketName: string) {
    // allow public read for all files
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };

    // set policy
    return new Promise((resolve, reject) => {
      this._client.setBucketPolicy(bucketName, JSON.stringify(policy), (err) => {
        if (err) {
          reject(err);
        }

        resolve(true);
      });
    });
  }

  // get connector type
  getConnector(endpoint: string) {
    // check endpoint is valid
    if (!endpoint) {
      throw new Error(`Minio endpoint is invalid`);
    }

    // get connector type from endpoint
    if (endpoint.includes("googleapis.com")) {
      return "google";
    }
    if (endpoint.includes("amazonaws.com")) {
      return "aws";
    }
    return "minio";
  }

  // check
  async checkBucketExists() {
    return await this._client.bucketExists(this.bucket);
  }

  // upload file from fs to minio
  async uploadFS(fileName: string, fsPath: string) {
    return await this._client
      .fPutObject(this.bucket, fileName, fsPath, {
        "Content-Type": mimetype.contentType(fsPath),
      })
      .then((result) => {
        return {
          downloadUrl: `${this.endpoint}/${this.bucket}/${fileName}`,
          etag: result.etag,
          versionId: result.versionId,
          bucket: this.bucket,
          fileName: fileName,
        };
      }); // return url
  }

  // get object from minio
  async getObjectFS(fileName: string, fsPath: string) {
    return await this._client.fGetObject(this.bucket, fileName, fsPath);
  }

  // presigned url
  async presignedDownloadUrl(fileName: string, expiry = 60) {
    return await this._client.presignedGetObject(this.bucket, fileName, expiry);
  }

  // remove object from minio
  async removeObject(fileName: string) {
    return await this._client.removeObject(this.bucket, fileName);
  }
}
