package com.hotelix.service;


import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.hotelix.exception.OurException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class AwsS3Service {

    @Value("${aws.s3.bucket.name:hotelix-images}")
    private String bucketName;

    @Value("${aws.s3.access.key:dummy}")
    private String awsS3AccessKey;

    @Value("${aws.s3.secret.key:dummy}")
    private String awsS3SecretKey;

    @Value("${server.port:4040}")
    private String serverPort;

    public String saveImageToS3(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            return null;
        }

        // If real AWS credentials are provided, attempt S3 upload
        if (awsS3AccessKey != null && !awsS3AccessKey.isBlank() && !"dummy".equalsIgnoreCase(awsS3AccessKey)
                && awsS3SecretKey != null && !awsS3SecretKey.isBlank() && !"dummy".equalsIgnoreCase(awsS3SecretKey)) {
            try {
                String s3Filename = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsS3AccessKey, awsS3SecretKey);
                AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                        .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                        .withRegion(Regions.US_EAST_2)
                        .build();

                InputStream inputStream = photo.getInputStream();
                ObjectMetadata metadata = new ObjectMetadata();
                metadata.setContentType(photo.getContentType() != null ? photo.getContentType() : "image/jpeg");

                PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3Filename, inputStream, metadata);
                s3Client.putObject(putObjectRequest);
                return "https://" + bucketName + ".s3.amazonaws.com/" + s3Filename;
            } catch (Exception e) {
                System.err.println("AWS S3 upload failed, falling back to local file storage: " + e.getMessage());
            }
        }

        // Fallback: save image locally to uploads directory
        try {
            java.io.File uploadDir = new java.io.File("uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            String rawFileName = photo.getOriginalFilename() != null ? photo.getOriginalFilename().replaceAll("\\s+", "_") : "photo.jpg";
            String localFilename = System.currentTimeMillis() + "_" + rawFileName;
            java.nio.file.Path targetPath = uploadDir.toPath().resolve(localFilename);
            java.nio.file.Files.copy(photo.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            return "http://localhost:" + serverPort + "/images/" + localFilename;
        } catch (Exception e) {
            e.printStackTrace();
            throw new OurException("Unable to save image: " + e.getMessage());
        }
    }
}

















