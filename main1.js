const poi = require('./poi')
const co = require('co')

let types = [
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


const config = require('./config')





co(function* () {
    for (let i = 0; i < types.length; i++) {
        let typeName = types[i]
        yield* poi.get(typeName, config, 100)
    }    
})
.catch(err=>{
    console.log(err)
})

