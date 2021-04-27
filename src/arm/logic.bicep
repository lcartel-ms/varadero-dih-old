param location string
param name_prefix string
param is_kubeEnvironment bool
param appSettings_insights_key string
param webapp_plan string

var storage_name = '${uniqueString(resourceGroup().id)}stor'
var logic_plan_name = '${name_prefix}-funcplan'
var logic_name = '${name_prefix}-logic-${uniqueString(resourceGroup().id)}'

resource storage_account 'Microsoft.Storage/storageAccounts@2019-06-01' = {
  name: storage_name
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_RAGRS'
  }
}

resource logic 'Microsoft.Web/sites@2020-06-01' = {
  name: logic_name
  location: location
  kind: !is_kubeEnvironment ? 'workflowapp,functionapp' : 'kubernetes,workflowapp,functionapp,linux'
  properties: {
    siteConfig: {
      netFrameworkVersion: 'v4.6'
      alwaysOn: true
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '80'
        }
        {
          name: 'K8SE_FUNCTIONS_TRIGGERS'
          value: '{"hostJson":{"version":"2.0","logging":{"applicationInsights":{"samplingExcludedTypes":"Request","samplingSettings":{"isEnabled":true}},"logLevel":{"Host.Triggers.Workflow":"Debug"}}},"functionsJson":{}}'
        }
        {
          name: 'APP_KIND'
          value: 'workflowApp'
        }
        {
          name: 'FUNCTION_APP_EDIT_MODE'
          value: 'readOnly'
        }
        {
          name: 'AzureFunctionsJobHost__extensionBundle__id'
          value: 'Microsoft.Azure.Functions.ExtensionBundle.Workflows'
        }
        {
          name: 'AzureFunctionsJobHost__extensionBundle__version'
          value: '[1.*, 2.0.0)'
        }
        {
          name: 'FUNCTIONS_V2_COMPATIBILITY_MODE'
          value: 'true'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storage_account.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storage_account.id, storage_account.apiVersion).keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storage_account.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storage_account.id, storage_account.apiVersion).keys[0].value}'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~12'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: '${appSettings_insights_key}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: logic_name
        }
      ]
    }
    serverFarmId: webapp_plan
    clientAffinityEnabled: false
  }
}


output logic_id string = logic.id
output logic_hostname string = logic.properties.hostNames[0]

