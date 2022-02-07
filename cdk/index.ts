#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { RestApiStack } from './rest-api-stack'

class MyRestApiStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props)
    if (!props?.env?.account || !props?.env?.region) throw new Error('No region or account id set')
    
    new RestApiStack(this, 'MyRestApiStack', {
      domainName: 'example-domain.com',
      siteSubDomain: 'api',
    })
  }
}

const app = new cdk.App()

new MyRestApiStack(app, 'RestApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
})

app.synth()