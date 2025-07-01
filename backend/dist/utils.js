"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
function random(len) {
    const options = "jbsfjdbvbkbbkefbksvbkjbsfdjkvb1212324783546653475734567204907";
    let ans = "";
    for (let i = 0; i < len; i++) {
        ans = ans + options[Math.floor(Math.random() * options.length)];
    }
    return ans;
}
