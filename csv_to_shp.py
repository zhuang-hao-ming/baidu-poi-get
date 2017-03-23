# encoding: utf-8
import arcpy
arcpy.env.workspace = "E:/test/3_22/poi_get/output"

types = [
    '美食',
    '酒店',
    '购物',
    '生活服务',
    '丽人',
    '旅游景点',
    '休闲娱乐',
    '运动健身',
    '教育培训',
    '文化传媒',
    '医疗',
    '汽车服务',
    '交通设施',
    '金融',
    '房地产',
    '公司企业',
    '政府机构',
]

spRef = arcpy.SpatialReference(4326)
try:
    for i in range(len(types)):
        type = types[i]
        out_Layer = '%s.shp' % type 
        saved_Layer = "shp/%s.shp" % type 
        arcpy.MakeXYEventLayer_management("%s.csv" % type, "FIELD3", "FIELD2",out_Layer , spRef)
        print(arcpy.GetCount_management(out_Layer))
        arcpy.SaveToLayerFile_management(out_Layer, saved_Layer)
except Exception as err:
    print(err.args[0])
