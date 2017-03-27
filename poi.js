// main
const config = require('./config')
const superagent = require('superagent')
const co = require('co')
const fs = require('fs')
const transform = require('./transform')
const parallel = require('co-parallel')
const async = require('async')
const coordinateSplit = require('./coordinateSplit')



let qBase = {
    ak: config.ak,
    q: '',
    bounds: ``,
    output: 'json',
    coord_type: 1,
    page_size: 20,
    page_num: 0,
}




function getPoiPromise(q) {
    return new Promise((resolve, reject) => {

        async.retry(10, (cb) => {
            superagent.get(config.url)
                .query(q)
                .timeout({
                    response: 5000
                })
                .end((err, res) => {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null, res)
                    }
                })
        }, (err, res) => {
            if (err) {
                resolve({ err, q }) // 重连5次后，仍然错误， 也不要抛出错误，避免程序终止
            } else {
                let obj
                try {
                    obj = JSON.parse(res.text)
                    resolve(obj)
                } catch(err) {
                    console.log(res.text)
                    resolve({ err, q }) // 重连5次后，仍然错误， 也不要抛出错误，避免程序终止
                }
                
                

            }
        })

    })
}

function* thunnkGet(q) {
    return yield getPoiPromise(q)
}






let numOfPoints = 0
let numOfQuery = 0
let numOfError = 0



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
function* get(type = '政府机构', config = config, numOfCell = 100) {
    qBase.q = type
    // 输出文件
    let outputFileName = `./output/${type}.csv`
    let writer = fs.createWriteStream(outputFileName)
    // 坐标对序列
    let coordArr = coordinateSplit(numOfCell, config.bound.bottomLeft, config.bound.topRight)

    let queryArr = []
    let prePromiseArr = []
    // 这个循环， 对每个小块发起一个请求，来获得小块内的POI数目。
    for (let i = 0; i < coordArr.length; i++) {
        let coord = coordArr[i]
        let q = Object.assign({}, qBase, {
            bounds: `${coord.bl.lat},${coord.bl.lng},${coord.tr.lat},${coord.tr.lng}`,
            page_num: 0
        })
        queryArr.push(q)
        prePromiseArr.push(thunnkGet(q))
    }

    let preResArr = yield parallel(prePromiseArr, 50)

    for (let i = 0; i < preResArr.length; i++) {
        numOfPoints += preResArr[i].total
    }


    // 这个循环， 针对前一步获得的，块内POI数目，根据块内的POI数目，并发的发出多个请求，来获得具体的POI
    let promiseArr = []
    for (let i = 0; i < queryArr.length; i++) {
        let q = queryArr[i]
        let total = preResArr[i].total
        if (total > 0) {

            let pageCount = Math.ceil(total / 20)

            console.log('页数：' + pageCount)

            for (let i = 0; i < pageCount; i++) {
                let pageQuery = Object.assign({}, q, {
                    page_num: i
                })

                // console.log(pageQuery)
                numOfQuery++
                promiseArr.push(thunnkGet(pageQuery))
            }
        }
    }

    let resArr = yield parallel(promiseArr, 50)

    for (let i = 0; i < resArr.length; i++) {

        let results = resArr[i].results
        if (!results) {
            numOfError++
            console.log(resArr[i])
            continue
        }


        console.log(`获得 ${results.length} 条`)
        for (let j = 0; j < results.length; j++) {
            let item = results[j]
            if ( !item || !item.location) {
                continue
            }
            let wgsLnglat = transform.bd2wgs(item.location.lat, item.location.lng)
            writer.write(`${item.name},${wgsLnglat.lat},${wgsLnglat.lng},${item.address},${item.uid}\n`)
        }
    }
    console.log('兴趣点数目:' + numOfPoints)
    console.log('请求数目：' + numOfQuery)
    console.log('错误数目:' + numOfError)

}



module.exports = {
    get
}




