import requests
import streamlit as st

# Streamlit UI for user input
st.markdown("""
    <style>
    /* General settings */
    body {
        background-color: #f0f0f0;
    }

    /* Rainbow gradient for title */
    .rainbow-text {
        background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
        -webkit-background-clip: text;
        color: transparent;
        font-size: 3em;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
    }

    /* Customize text input box */
    input {
        border: 2px solid white;
        border-radius: 5px;
        padding: 10px;
        font-size: 1.1em;
        width: 100%;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    /* Style submit button */
    .stButton > button {
        background: linear-gradient(to right, #ff6b6b, #f0c27b);
        color: white;
        font-size: 1.2em;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: pointer;
        transition: background 0.5s ease;
    }

    .stButton > button:hover {
        background: linear-gradient(to right, #f0c27b, #ff6b6b);
    }

    /* Styling the response box */
    .response-box {
        border: 2px solid #6c63ff;
        border-radius: 10px;
        background-color: #ffffff;
        padding: 15px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        font-size: 1.2em;
        color: #333;
        margin-top: 20px;
    }

    </style>
""", unsafe_allow_html=True)

st.markdown('<div class="rainbow-text">CodeBot</div>', unsafe_allow_html=True)

api_key = "aVoCwJDkPdqxc5ODf6huDdBM8myOUUnK"
external_user_id = "user"
query = st.text_input("Enter your query here:")

if st.button("Submit Query"):
    # Create Chat Session
    create_session_url = "https://api.on-demand.io/chat/v1/sessions"
    create_session_headers = {
        "apikey": api_key
    }
    create_session_body = {
        "pluginIds": ["plugin-1726251289", "plugin-1726253948", "plugin-1726257849", "plugin-1726259557"],
        "externalUserId": external_user_id
    }

    response = requests.post(create_session_url, headers=create_session_headers, json=create_session_body)
    session_data = response.json()
    session_id = session_data['data']['id']

    # Submit Query
    submit_query_url = f"https://api.on-demand.io/chat/v1/sessions/{session_id}/query"
    submit_query_headers = {
        "apikey": api_key
    }
    submit_query_body = {
        "endpointId": "predefined-openai-gpt4o",
        "query": query,
        "pluginIds": ["plugin-1712327325", "plugin-1713962163", "plugin-1726251289"],
        "responseMode": "sync"
    }

    response = requests.post(submit_query_url, headers=submit_query_headers, json=submit_query_body)
    query_response = response.json()

    # Display the response in a styled response box
    st.markdown(f'<div class="response-box">Response: {query_response["data"]["answer"]}</div>', unsafe_allow_html=True)
