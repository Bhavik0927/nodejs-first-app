/*const newname  = "Hello";
const newname2 = "Hello2";
const newname3  = "Hello3";


export default newname;
export {newname2,newname3} */


export const generateNumber = () =>{
    // ~~ is used for Math.floor
    return `${~~(Math.random()*100)}%`;
}

