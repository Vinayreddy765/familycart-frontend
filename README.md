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
     +---- Amazon Bedrock```

##Backend

The frontend communicates with the FamilyCart backend through an AWS API Gateway HTTP API.

Backend services include:

AWS Lambda
Amazon API Gateway
Amazon DynamoDB
Amazon Bedrock
Local Development
Install dependencies
npm install
Start development server
npm run dev
Build for production
npm run build
Preview production build
npm run preview
Project Structure
src/
├── api/
│   └── client.ts
├── components/
│   ├── ActivityFeed.tsx
│   ├── CreatePlanDialog.tsx
│   ├── Header.tsx
│   ├── HeroInput.tsx
│   ├── HouseholdMemory.tsx
│   ├── PlanHeader.tsx
│   ├── PurchaseDialog.tsx
│   └── ShoppingList.tsx
├── hooks/
│   └── useAppData.ts
├── types/
│   └── index.ts
├── App.tsx
├── index.css
└── main.tsx
Product Vision

FamilyCart is designed as a real household product rather than a one-time shopping list.

The long-term goal is to give a household a shared memory of:

What we need → How much we need → Who will buy it → What was actually bought → What we usually need

Future versions can introduce real family accounts, notifications, richer household analytics, and additional family roles.

AWS Zero to Shipped Hackathon

FamilyCart was built and deployed on AWS for the AWS Zero to Shipped Hackathon 2026.

Category: Daily Life Enhancement

Lane: Startup
