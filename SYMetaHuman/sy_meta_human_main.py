from PySide2.QtWidgets import *

class SYMetaHumanMainWidget(QWidget):
    def __init__(self):
        super(SYMetaHumanMainWidget, self).__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle("SY Meta Human")
        self.setGeometry(100, 100, 1000, 600)

    def create_ui(self):
        pass

    def create_layout(self):
        pass