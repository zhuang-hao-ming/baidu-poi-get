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

# regionName = 'baoan.shp'
regionName = 'longgan.shp'
# regionName = 'yantian.shp'
# regionName = 'luohu.shp'
# regionName = 'futian.shp'
# regionName = 'nanshan.shp'

outputFeatureDir = '/feature_longgan'
outputSelDir = '/sel_longgan'

spRef = arcpy.SpatialReference(4326)
arcpy.MakeFeatureLayer_management(regionName,"region_layer")
try:
    for type in types:
        
        out_Layer = type 
        try:
            arcpy.MakeXYEventLayer_management("%s.csv" % type, "FIELD3", "FIELD2",out_Layer , spRef)
        except Exception as err1:
            continue
        print(u'数目', arcpy.GetCount_management(out_Layer))

        
        arcpy.FeatureClassToFeatureClass_conversion(out_Layer, outputFeatureDir, '%s_feature' % out_Layer)
        
        feature_layer = "feature_layer%s" % type
        
        arcpy.MakeFeatureLayer_management(outputFeatureDir + '/%s_feature.shp' % type,feature_layer)

        arcpy.SelectLayerByLocation_management(feature_layer, 'WITHIN','region_layer')
        
        arcpy.CopyFeatures_management(feature_layer, outputSelDir + '/%s_sel' % out_Layer)
except Exception as err:
    print(err.args[0])
    print('error')
