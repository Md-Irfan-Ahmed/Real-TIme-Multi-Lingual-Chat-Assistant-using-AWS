# Real-TIme-Multi-Lingual-Chat-Assistant-using-AWS
A scalable, serverless, real-time chat assistant capable of handling multi-lingual conversations using a suite of AWS services. This project demonstrates a cloud-native architecture built for efficient communication, real-time language translation, and seamless deployment.
Features
🌐 Real-Time Chat Support: Enables users to send and receive messages in real time.

🌍 Multi-Lingual Translation: Automatically translates messages between multiple languages using Amazon Translate, allowing users to communicate regardless of language barriers.

☁️ Serverless Backend: Built using AWS Lambda and API Gateway for highly scalable and cost-effective operations.

📦 Persistent Storage: All chat data is stored and retrieved securely using Amazon DynamoDB.

✉️ Email Integration: Sends chat transcripts and notifications via Amazon SES (Simple Email Service).

🖥️ Frontend Hosting: A static web client hosted using Amazon S3 and delivered globally via Amazon CloudFront for high availability and low latency.

🛠️ AWS Services Used
Amazon S3 – Static website hosting for the frontend

Amazon CloudFront – CDN for secure and fast content delivery

Amazon API Gateway – Exposes RESTful APIs to interact with the backend

AWS Lambda – Handles backend logic and event-driven tasks

Amazon Translate – Real-time language translation for chat messages

Amazon SES – Sends emails and chat summaries

Amazon DynamoDB – Stores chat history and user metadata

📚 Use Cases
Real-time customer support with language translation

Cross-border team communication platforms

Educational or counseling platforms supporting diverse languages
