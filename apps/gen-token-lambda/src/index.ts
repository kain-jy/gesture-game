import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IvschatClient, CreateChatTokenCommand, ChatTokenCapability } from '@aws-sdk/client-ivschat';

const ivsChatClient = new IvschatClient({
  region: process.env.AWS_REGION || 'us-west-2',
});

interface TokenRequestBody {
  chatRoomArn: string;
  userId: string;
  username?: string;
  capabilities?: ChatTokenCapability[];
  sessionDurationInMinutes?: number;
  attributes?: Record<string, string>;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const requestBody: TokenRequestBody = JSON.parse(event.body);
    
    // Validate required fields
    if (!requestBody.chatRoomArn || !requestBody.userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'chatRoomArn and userId are required' 
        }),
      };
    }

    // Default capabilities if not provided
    const capabilities = requestBody.capabilities || [ChatTokenCapability.SEND_MESSAGE];
    
    // Create chat token
    const command = new CreateChatTokenCommand({
      roomIdentifier: requestBody.chatRoomArn,
      userId: requestBody.userId,
      capabilities: capabilities,
      sessionDurationInMinutes: requestBody.sessionDurationInMinutes || 180, // 3 hours default
      attributes: {
        username: requestBody.username || requestBody.userId,
        ...requestBody.attributes,
      },
    });

    const response = await ivsChatClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: response.token,
        sessionExpirationTime: response.sessionExpirationTime,
        tokenExpirationTime: response.tokenExpirationTime,
      }),
    };
  } catch (error) {
    console.error('Error creating chat token:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create chat token',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};