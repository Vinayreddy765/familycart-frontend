# FamilyCart - Frontend

FamilyCart is a shared household shopping memory that helps families decide what to buy, how much they need, who is shopping, and what was purchased previously.

## Live Application

https://d1xn4vo99gvwgt.cloudfront.net

## Overview

FamilyCart allows family members to:

- Create and manage shopping plans
- Add household items using natural language
- Specify quantities and units
- Edit or remove shopping items
- Record actual purchased quantities
- Support partial purchases
- View household purchase history
- Get suggestions based on previous purchasing patterns
- View household memory and activity

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Amazon CloudFront
- Amazon S3

## Architecture

```text
React + Vite
     |
     v
Amazon CloudFront
     |
     v
Private Amazon S3
     |
     | HTTPS API
     v
Amazon API Gateway
     |
     v
AWS Lambda
     |
     +---- DynamoDB
     |
     +---- Amazon Bedrock
