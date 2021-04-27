param location string
param name_prefix string
param is_kubeEnvironment bool
param storage string
param appSettings_insights_key string

var apimName = '${name_prefix}-apim-${uniqueString(resourceGroup().id)}'
var apim_product_name = 'accessories'

param apiName string = 'webapi'
param capacity int = 0 // has to be 0 for Consumption tier
param email string = 'contoso@contoso.com'
param org string = 'Contoso'

// replace below link to be the api definition of the web app
param oaslink string = 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore.yaml'

resource apim 'Microsoft.ApiManagement/service@2020-06-01-preview' = {
  name: apimName
  location: location
  sku: {
    name: 'Consumption'
    capacity: capacity 
  }
  properties:{
    publisherEmail: email
    publisherName: org
  }
}

resource webapi 'Microsoft.ApiManagement/service/apis@2020-06-01-preview'= {
  name: '${apimName}/${apiName}'
  properties: {
    format: 'openapi-link'
    value: oaslink
    path: 'petstore'
  }
}

output apimId string = apim.id
