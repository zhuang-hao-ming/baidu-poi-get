## 介绍

这个程序包含两个脚本，一个nodejs脚本负责完成POI数据获取，一个python脚本负责将csv数据转换为shpapefile文件。

## POI数据获取

`main1.js`: 入口文件，遍历百度POI的十七种POI类型并分别调用抓取模块`poi.get`。

`poi.js`: 主模块，提供借口`poi.get`供外部调用，接口的参数如下。

```

/**
 * 获取POI的函数
 * @param {string} type POI类型
 * @param {Object} config 配置对象
 * @param {Object} config.bound 坐标范围
 * @param {Object} config.bound.bottomLeft 左下角极点
 * @param {Object} config.bound.topRight 右上角极点
 * @param {number} config.bound.topRight.lat 纬度
 * @param {number} config.bound.topRight.lng 经度
 * @param {string} config.ak 百度api ak
 * @param {string} config.url 百度api url
 */
 poi.get
```

`transform.js`： BD09LL坐标系到WGS84坐标系的转换库，来源： [eviltransform](https://github.com/googollee/eviltransform)

`coordinateSplit.js`: 划分坐标区间的模块

`main.js`: 废弃文件


## csv to shp

`csv_to_shp.py`: 这个脚本首先把csv文件转换为arcgis的event layer， 然后再转换为feature class（添加FID），
然后使用`select by location`选择出一个目标子集，最后保存为shp文件。


参考文档：

1. [nodejs数据处理实践之百度poi数据获取](http://note.youdao.com/noteshare?id=6b388d33df58ea6da531d21592627548)

2. [把csv文件导入arcgis处理生成shp文件](http://note.youdao.com/noteshare?id=90c2c7986a99318c98df0e7bf838bda1) 
