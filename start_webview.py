import webview

class Api:
    def say_hello(self, name):
        return f"Hello, {name}! From Python."

api = Api()

# Start a webview window with API exposed
webview.create_window("My App", "C:/Users/bossf/Desktop/frontend2/project4/dist/index.html", text_select=True)
webview.start()
