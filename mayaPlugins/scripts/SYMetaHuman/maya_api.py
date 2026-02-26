import maya.mel as mel
import maya.cmds as cmds

class MayaApi(object):

    @staticmethod
    def get_selected_objects(self):
      return cmds.ls(selection=True)
