import * as cdk from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';
import { join } from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { addCorsOptions } from '../lambdas/cors';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
const maTable = {
  STRING: 'Coucou',
  NUMBER: 12
};
export class FollowPlantsBackStack extends cdk.Stack {

  db: Table; // Table de l'application
  maTable = maTable.STRING;
  api: RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Créer une table dynamodb
    this.db = new Table(this, 'capteur-un', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'capteur-un',
      // removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Créer des lambdas
    const plantesGet = new NodejsFunction(this, 'plantesGetUn', this.setProps('../lambdas/get-capteur.ts', this.db.tableName));
    const plantesPost = new NodejsFunction(this, 'plantesPostUn', this.setProps('../lambdas/post-capteur.ts', this.db.tableName));
    const plantesDelete = new NodejsFunction(this, 'plantesDeleteUn', this.setProps('../lambdas/delete-capteur.ts', this.db.tableName));
    const plantesUp = new NodejsFunction(this, 'plantesUpdateUn', this.setProps('../lambdas/update-capteur.ts', this.db.tableName));

    // Attribuer des droits aux lambdas sur la base de données
    this.db.grantReadData(plantesGet);
    this.db.grantWriteData(plantesPost);
    this.db.grantWriteData(plantesDelete);
    this.db.grantWriteData(plantesUp);

    // API Gateway pour appeler les lambdas et récupérer les données
    this.api = new RestApi(this, 'apiPlantes', {
      restApiName: ' check-humidite-API'
    });
    // Créer les intégrations qui feront le lien entre les routes et les lambdas
    const lambdaGetIntegration = new LambdaIntegration(plantesGet);
    const lambdaPutIntegration = new LambdaIntegration(plantesUp);
    const lambdaPostIntegration = new LambdaIntegration(plantesPost);
    const lambdaDeleteIntegration = new LambdaIntegration(plantesDelete);

    // Créer les routes de l'API ---------------------------------
    //GET ------
    const humidite = this.api.root.addResource('humidite'); // On crée la ressource (route) humidité
    const humiditeGet = humidite.addResource('get'); // On crée une ressource get dans la route humidite
    humiditeGet.addMethod('GET', lambdaGetIntegration); // On crée une méthode pour les requêtes HTTP et on injecte l'intégration

    //PUT ------
    const humiditePut = humidite.addResource('put');
    humiditePut.addMethod('PUT', lambdaPutIntegration);

    //POST ------
    const humiditePost = humidite.addResource('post');
    humiditePost.addMethod('POST', lambdaPostIntegration);

    //DELETE ------
    const humiditeDelete = humidite.addResource('delete');
    humiditeDelete.addMethod('DELETE', lambdaDeleteIntegration);
  }
  // Etablir une lambda pour faire un get
  setProps(file: string, table: string): NodejsFunctionProps {
    return {
      memorySize: 128,
      entry: join(__dirname, file),
      environment: {
        TABLE: table,
        CLE: 'id'
      },
      runtime: lambda.Runtime.NODEJS_16_X
    }
  }
}