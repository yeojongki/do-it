function myInstanceOf(left, right) {
  let rightProto = right.prototype; // 取右边表达式的显示原型
  left = left.__proto__; // 取左边表达式的隐式原型
  while (true) {
    if (left === null) return false;
    if (left === rightProto) return true;
    left = left.__proto__;
  }
}

function Person(name, age, sex) {
  this.name = name;

  this.age = age;

  this.sex = sex;
}

function Student(name, age, sex, score) {
  Person.call(this, name, age, sex);

  this.score = score;
}

Student.prototype = new Person(); // 这里改变了原型指向，实现继承

let student = new Student('小明', 20, '男', 99); // 创建了学生对象student

console.log(myInstanceOf(student, Student)); // true

console.log(myInstanceOf(student, Person)); // true
