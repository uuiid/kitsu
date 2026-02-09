import sys

from PySide2.QtWidgets import QWidget, QVBoxLayout, QSpacerItem, QSizePolicy, QScrollArea, QTabWidget
from PySide2.QtCore import QSize, QSizePolicy, Qt
from PySide2.QtWidgets.QApplication import QApplication


class ScrollAreaWidget(QScrollArea):
  def __init__(self, *args, **kwargs):
    super(ScrollAreaWidget, self).__init__(*args, **kwargs)
    self.setWidgetResizable(True)
    self.content_widget = QWidget(self)
    self.setWidget(self.content_widget)
    self.content_layout = QVBoxLayout()
    self.content_widget.setLayout(self.content_layout)
    self.content_layout.setContentsMargins(0, 0, 0, 0)
    self.content_layout.addItem(QSpacerItem(0, 0, QSizePolicy.Expanding, QSizePolicy.Expanding))


class ModelWidget(QWidget):
  def __init__(self, *args, **kwargs):
    super(ModelWidget, self).__init__(*args, **kwargs)
    self.layout = QVBoxLayout()
    self.setLayout(self.layout)
    self.list_view = ScrollAreaWidget()
    self.layout.addWidget(self.list_view)


class BindWidget(QWidget):
  def __init__(self, *args, **kwargs):
    super(BindWidget, self).__init__(*args, **kwargs)
    self.layout = QVBoxLayout()
    self.setLayout(self.layout)
    self.list_view = ScrollAreaWidget()
    self.layout.addWidget(self.list_view)


class SYMetaHumanMainWidget(QWidget):
  def __init__(self):
    super(SYMetaHumanMainWidget, self).__init__()
    self.initUI()
    self.layout = QVBoxLayout()
    self.setLayout(self.layout)
    self.content_widget = QTabWidget()
    self.model_widget = ModelWidget()
    self.bind_widget = BindWidget()
    self.content_widget.addTab(self.model_widget, "模型")
    self.content_widget.addTab(self.bind_widget, "绑定")
    self.layout.addWidget(self.content_widget)

  def initUI(self):
    self.setWindowTitle("SY Meta Human")
    self.setGeometry(100, 100, 1000, 600)


if __name__ == "__main__":
  app = QApplication(sys.argv)
  window = SYMetaHumanMainWidget()
  window.show()
  sys.exit(app.exec_())
