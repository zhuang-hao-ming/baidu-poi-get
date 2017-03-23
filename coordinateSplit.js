/**
 * 把一个由bottomLeft和topRight指定区域均匀划分为numOfCell块
 * 
 */
module.exports = function (numOfCell=100, bl, tr) {
    
    let numOfRowOrCoL = Math.sqrt(numOfCell)



    let spanLng = tr.lng - bl.lng
    let spanLat = tr.lat - bl.lat



    // 经度的步长
    let stepLng = spanLng / numOfRowOrCoL
    // 纬度的步长
    let stepLat = spanLat / numOfRowOrCoL

    let lngArr = []
    let latArr = []


    let beginLng = bl.lng
    let beginLat = bl.lat
    for (let i = 0; i < numOfRowOrCoL; i++) {
        lngArr.push(beginLng + i * stepLng)
        latArr.push(beginLat + i * stepLat)
    }
    lngArr.push(tr.lng)
    latArr.push(tr.lat)


    let coordArr = []
    for (let row = 0; row < numOfRowOrCoL; row++) {
        for (let col = 0; col < numOfRowOrCoL; col++) {

            let bl = {
                lat: latArr[row],
                lng: lngArr[col],
            }
            let tr = {
                lat: latArr[row + 1],
                lng: lngArr[col + 1],
            }
            coordArr.push({
                bl,
                tr,
            })
        }
    }

    return coordArr
}
