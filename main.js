// main
const config = require('./config')
const superagent = require('superagent')
const co = require('co')
const fs = require('fs')
const transform = require('./transform')
const parallel = require('co-parallel')
const async = require('async')
let type = process.argv[2] || '政府机构'
let outputFileName = `.output/${type}.csv`
let writer = fs.createWriteStream(outputFileName)


const coordinateSplit = require('./coordinateSplit')
// 获得坐标块
let coordArr = coordinateSplit(100, config.bound.bottomLeft, config.bound.topRight)



let qBase = {
    ak: config.ak,
    q: type,
    bounds: ``,
    output: 'json',
    coord_type: 1,
    page_size: 20,
    page_num: 0,
}

//  深圳 政府机构的poi数量 10827


function getPoiPromise(q) {
    return new Promise((resolve, reject) => {

        async.retry(5, (cb) => {
            superagent.get(config.url)
                .query(q)
                .timeout({
                    response: 500
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
                resolve({err,q}) // 重连5次后，仍然错误， 也不要抛出错误，避免程序终止
            } else {
                let obj = JSON.parse(res.text)
                resolve(obj)

            }
        })

    })
}

let numOfPoints = 0
let numOfQuery = 0
let numOfError = 0
function* thunnkGet(q) {
    return yield getPoiPromise(q)
}





co(function* () {

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

    let preResArr = yield parallel(prePromiseArr, 80)

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

    let resArr = yield parallel(promiseArr, 100)
    
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
            let wgsLnglat = transform.bd2wgs(item.location.lat, item.location.lng)
            writer.write(`${item.name},${wgsLnglat.lat},${wgsLnglat.lng},${item.address},${item.uid}\n`)
        }
    }

})
    .catch(err => {
        console.log(err)
    })
    .then(() => {
        console.log('兴趣点数目:' + numOfPoints)
        console.log('请求数目：' + numOfQuery)
        console.log('错误数目:' + numOfError)
    })


// console.log(lngArr.length)
// console.log(lngArr)
// console.log(latArr.length)
// console.log(latArr)
// console.log(coordArr.length)