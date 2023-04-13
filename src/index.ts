// Load the SDK for JavaScript
import * as dotenv from 'dotenv';
dotenv.config();

import GenerateMetadata from './generateMetadata';

exports.handler = GenerateMetadata;
