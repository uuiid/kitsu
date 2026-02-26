import sys

from PySide2.QtWidgets import QWidget, QVBoxLayout, QSpacerItem, QSizePolicy, QScrollArea, QTabWidget, QLabel, \
  QLineEdit, QPushButton, QSizePolicy, QApplication, QHBoxLayout
from PySide2.QtCore import QSize, Qt


class ModelWidgetCell(QWidget):
  def __init__(self, *args, **kwargs):
    super(ModelWidgetCell, self).__init__()
    self.layout = QHBoxLayout()
    self.layout.setContentsMargins(6, 1, 6, 1)
    self.setLayout(self.layout)
    label_text = args[0] if args else kwargs.get("name", "")
    self.label = QLabel(label_text)
    self.label.setMaximumWidth(30)
    self.label.setMinimumWidth(30)
    self.line_edit = QLineEdit()
    self.push_button = QPushButton("加载")
    self.layout.addWidget(self.label)
    self.layout.addWidget(self.line_edit)
    self.layout.addWidget(self.push_button)
    self.push_button.clicked.connect(self.load_model)


  def load_model(self):
    pass


class ScrollAreaWidget(QScrollArea):
  def __init__(self, *args, **kwargs):
    super(ScrollAreaWidget, self).__init__(*args, **kwargs)
    self.setWidgetResizable(True)
    self.items = []
    self.item_number = 0
    self.content_widget = QWidget(self)
    self.setWidget(self.content_widget)
    self.content_layout = QVBoxLayout()
    self.content_widget.setLayout(self.content_layout)
    self.content_layout.setContentsMargins(0, 0, 0, 0)
    self.content_layout.addItem(QSpacerItem(0, 0, QSizePolicy.Expanding, QSizePolicy.Expanding))

  def add_widget(self, widget):
    self.items.append(widget)
    self.content_layout.insertWidget(self.item_number, widget)
    self.item_number += 1

  def remove_widget(self):
    self.items.pop(self.item_number - 1)
    self.content_layout.removeWidget(self.items[self.item_number - 1])
    self.item_number -= 1


class ModelWidget(QWidget):
  def __init__(self, *args, **kwargs):
    super(ModelWidget, self).__init__(*args, **kwargs)
    self.layout = QVBoxLayout()
    self.layout.setContentsMargins(0, 0, 0, 0)
    self.setLayout(self.layout)
    self.list_view = ScrollAreaWidget()
    self.layout.addWidget(self.list_view)
    self.initUI()

  def initUI(self):
    for name in ["头部*", "身体*", "右眼*", "左眼*", "虹膜", "眼睑", "睫毛", "牙齿*", "牙龈", "软骨"]:
      self.add_model(name)

  def add_model(self, name):
    widget = ModelWidgetCell(name)
    self.list_view.add_widget(widget)


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
