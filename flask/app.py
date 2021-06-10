from flask import Flask, request, session
import socket

HOST = '127.0.0.1'

app = Flask(__name__)
app.secret_key = "parlpago"


def get_answer(sentence,PORT):

  mySock = socket.socket()
  mySock.connect((HOST, PORT))
  mySock.send(sentence.encode())
  data = mySock.recv(2048).decode()
  mySock.close()
  return data



@app.route("/chatbot",methods=['POST'])
def comunicate():
  data = request.json
  session['user'] = data['user']
  if 'user' in session:
    user = session['user']
    if user == 1 :
      PORT = 7777
      sentence = data['sentence']
      ret = get_answer(sentence,PORT)
      return ret

    elif user == 2:
      PORT = 7778
      sentence = data['sentence']
      ret = get_answer(sentence, PORT)
      return ret

    else:
      PORT = 7779
      sentence = data['sentence']
      ret = get_answer(sentence, PORT)
      return ret


@app.route("/")
def test():
  return "hello flask world"


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)
