from openai import OpenAI

api_key = "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"

client = OpenAI(api_key=api_key)

def extract_information(user_input):
    context = [
        {"role": "system", "content": "Rank the following crime descriptions by their severity from 1-10 in the format 'Number'"},
        {"role": "system", "content": "1 should be things like petty shop lifting and 10 should be something with death"}
    ]

    # Make a request to the API with context and user input
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        temperature=0.8,
        max_tokens=3000,
        response_format={"type": "text"},
        messages=context + [
            {"role": "user", "content": user_input}
        ]
    )

    output = response.choices[0].message.content

    return output