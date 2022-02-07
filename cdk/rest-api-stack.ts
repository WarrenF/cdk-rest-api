import {
  aws_certificatemanager as acm,
  aws_route53 as route53,
  aws_route53_targets as route53Targets,
  CfnOutput,
  Duration,
  Stack
} from 'aws-cdk-lib'
import {
  EndpointType,
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface RestApiProps {
  domainName: string
  siteSubDomain: string
}

export class RestApiStack extends Construct {
  constructor(
    scope: Stack,
    id: string,
    {
      domainName,
      siteSubDomain,
    }: RestApiProps) {
    super(scope, id)

    const siteDomain = `${siteSubDomain}.${domainName}`
    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', { domainName })
    const securityPolicy = SecurityPolicy.TLS_1_2
    
    const certificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone,
    })

    const api = new RestApi(this, 'RestApi', {
      restApiName: 'Todo Service',
      endpointTypes: [EndpointType.EDGE]
    })

    api.addDomainName('DomainName', {
      domainName: siteDomain,
      securityPolicy,
      certificate,
    })

    new route53.ARecord( this, "domain_alias_record", {
      recordName:  siteDomain,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(api))
    })

    const getTodosLambda = new NodejsFunction(this, 'GetTodosLambda', {
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(5),
      entry: join(__dirname, '../src/todoHandler.ts'),
      handler: 'handler',
    })

    const getTodosIntegration = new LambdaIntegration(getTodosLambda)
    
    const todos = api.root.addResource('todos')
    todos.addMethod('GET', getTodosIntegration)

    new CfnOutput(this, 'Api', { value: api.url })
    new CfnOutput(this, 'CustomDomain', { value: siteDomain })
  }
}
