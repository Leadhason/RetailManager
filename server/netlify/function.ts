import express from 'express';
import serverless from 'serverless-http';
import { app } from '../app'; // You'll need to separate your Express app setup

export const handler = serverless(app);
