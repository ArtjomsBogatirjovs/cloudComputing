/* //1.uzd
let x = "1234567";
for (let i = 1; i <= x.length * 2 - 1; i++) {
    const n = i <= x.length ? i : x.length * 2 - i;
    console.log("#".repeat(n));
}*/

/*2.uzd
let size = 8;
let chessboardLine;

for (let i = 0; i < size; i++) {
    chessboardLine = '';
    for (let j = 0; j < size; j++) {
        if ((i + j) % 2 === 0) {
            chessboardLine += " ";
        } else {
            chessboardLine += "#";
        }
    }
    console.log(chessboardLine);
}*/
/* 3.uzd
for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
        let time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        let now = new Date();
        let currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (time === currentTime) {
            console.log(`${time} !!!`);
        } else {
            console.log(time);
        }
    }
}
*/
