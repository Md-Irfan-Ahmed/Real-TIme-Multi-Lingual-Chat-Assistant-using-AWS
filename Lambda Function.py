import json
import boto3

# Initialize DynamoDB and Translate clients
dynamodb = boto3.client('dynamodb')
translate = boto3.client('translate')
table_name = 'project'  # DynamoDB table name

def lambda_handler(event, context):
    try:
        # Log the event for debugging
        print(f"Received event: {json.dumps(event)}")
        
        # Safely retrieve the HTTP method
        method = event.get('httpMethod', None)
        if not method:
            raise ValueError("Missing 'httpMethod' in the event.")
        
        # Customer sends a message (POST)
        ses = boto3.client('ses', region_name="ap-south-1") 

        # Define constants
        SENDER_EMAIL ="sender@gmail.com"  
        CUSTOMER_EMAIL = "reciever@gmail.com" 

        # Send email with conversation history
        if method == 'POST' and '/cutomer-email' in event['path']:
            body = json.loads(event['body'])
            print(body)
            formatted_messages = body["messages"] 
            if not formatted_messages:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Conversation data is missing'})
                }

            conversation_text = "\n\n".join(
                [f"{msg['role']}: {msg['message']}" for msg in formatted_messages.values()]
            )
            
            email_subject = "Your Conversation Summary"
            email_body = f"""
            Hello,

            Here is a summary of your conversation:

            {conversation_text}

            If you have any further queries, feel free to reach out.

            Regards,
            Support Team
            """

            response = ses.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [CUSTOMER_EMAIL]},
                Message={
                    'Subject': {'Data': email_subject},
                    'Body': {'Text': {'Data': email_body}}
                }
            )

            # Return success response
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Email sent success!'
                }),
                'headers':{
                    'Access-Control-Allow-Headers':'Content-Type,Authorization',
                    'Access-Control-Allow-Methods':"*",
                    'Access-Control-Allow-Origin':"*"
                }
            }
       # if method == 'POST' and '/customer-email' in event['path']:
        #    body = json.loads(event['body'])

        elif method == 'POST' and '/customer' in event['path']:
            
            # Extract the body from the event
            body = json.loads(event['body'])
            body = body['data']
            message_id = body.get('id')  # Get the ID from the request body
            msg = body.get('msg')
            language = body.get('language')
            status = body.get('status')
            
            # Validate inputs
            print(message_id,msg,language,status)
            if not message_id or not msg or not language or not status:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Missing required fields: id, msg, language, or status'})
                }
            
            # Store the message in DynamoDB
            dynamodb.put_item(
                TableName=table_name,
                Item={
                    'id': {'S': str(message_id)},  # Use the provided ID
                    'usermsg': {'S': msg},
                    'agentmsg': {'S': ''},  # Initially no agent message
                    'language': {'S': language},
                    'status': {'S': status}
                }
            )
            
            # Return success response
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Message saved successfully!',
                    'messageId': message_id
                }),
                'headers':{
                    'Access-Control-Allow-Headers':'Content-Type,Authorization',
                    'Access-Control-Allow-Methods':"*",
                    'Access-Control-Allow-Origin':"*"
                }
            }

        # Agent retrieves the message (GET)
        elif method == 'GET' and '/agent' in event['path']:
            query_params = event.get('queryStringParameters', {})
            message_id = query_params.get('id')
            agent_language = query_params.get('agent_language', 'en')  # Default to 'en' if not provided

            if not message_id:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Missing required query parameter: id'})
                }

            # Retrieve the item from DynamoDB by ID
            response = dynamodb.get_item(
                TableName=table_name,
                Key={'id': {'S': message_id}}
            )

            # Check if item was found
            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'message': 'Message not found'})
                }

            # Retrieve the message in the customer's language
            item = response['Item']
            original_msg = item['usermsg']['S']
            customer_language = item['language']['S']

            # Translate the message to the agent's language if needed
            translated_msg = original_msg
            if customer_language != agent_language:
                translation_response = translate.translate_text(
                    Text=original_msg,
                    SourceLanguageCode=customer_language,
                    TargetLanguageCode=agent_language
                )
                translated_msg = translation_response['TranslatedText']

            # Return the translated message to the agent
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'id': item['id']['S'],
                    'usermsg': translated_msg,
                    'agentmsg': item['agentmsg']['S'],
                    'status': item['status']['S']
                }),
                'headers':{
                'Access-Control-Allow-Headers':'Content-Type,Authorization',
                'Access-Control-Allow-Methods':"*",
                'Access-Control-Allow-Origin':"*"
                }
            }

        # Agent updates the message (PUT)
        elif method == 'PUT' and '/agent' in event['path']:
            body = json.loads(event['body'])
            print('put agent')
            print(body)
            message_id = body.get('id')
            agentmsg = body.get('agentmsg')
            status = body.get('status')

            if not message_id or not agentmsg or not status:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Missing required fields: id, agentmsg, or status'})
                }

            # Update the agent's message in DynamoDB
            print('before putting item')
            dynamodb.update_item(
                TableName=table_name,
                Key={'id': {'S': f'{message_id}'}},
                UpdateExpression="SET agentmsg = :agentmsg, #stat = :status",  # Use #stat to alias status
                ExpressionAttributeNames={
                    '#stat': 'status'  # Alias 'status' as #stat
                },
                ExpressionAttributeValues={
                    ':agentmsg': {'S': agentmsg},
                    ':status': {'S': status}
                }
            )
            print('aafter updating item')

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Agent message updated successfully'}),
                'headers':{
                'Access-Control-Allow-Headers':'Content-Type,Authorization',
                'Access-Control-Allow-Methods':"*",
                'Access-Control-Allow-Origin':"*"
                }
            }

        # Customer retrieves the translated message (GET) after agent update
        elif method == 'GET' and '/customer' in event['path']:
            print('before')
            query_params = event.get('queryStringParameters', {})
            message_id = query_params.get('id')
            print('after')

            if not message_id:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Missing required query parameter: id'})
                }

            # Retrieve the item from DynamoDB by ID
            response = dynamodb.get_item(
                TableName=table_name,
                Key={'id': {'S': message_id}}
            )
            print(response)

            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'message': 'Message not found'})
                }

            item = response['Item']
            agent_msg = item['agentmsg']['S']
            customer_language = item['language']['S']

            # Translate the agent's message to the customer's language
            translated_msg = agent_msg
            if customer_language != 'en' and agent_msg!='':  # Assuming agent always speaks English
                translation_response = translate.translate_text(
                    Text=agent_msg,
                    SourceLanguageCode='en',  # Agent language (English)
                    TargetLanguageCode=customer_language  # Customer's language
                )
                translated_msg = translation_response['TranslatedText']
            print('translated message')
            # Return the translated agent message to the customer
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'id': item['id']['S'],
                    'usermsg': item['usermsg']['S'],
                    'agentmsg': translated_msg,
                    'status': item['status']['S']
                }),
                'headers':{
                'Access-Control-Allow-Headers':'Content-Type,Authorization',
                'Access-Control-Allow-Methods':"*",
                'Access-Control-Allow-Origin':"*"
                }
            }

        else:
            return {
                'statusCode': 405,
                'body': json.dumps({'message': 'Method Not Allowed'})
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'An error occurred', 'error': str(e)}),
        }

