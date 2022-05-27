const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const User = require('../src/models/user')
const { userOneId, userOne, userTwoId, userTwo, taskOne, taskTwo, taskThree } = require('./fixtures/db')

beforeEach(async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()

})

test('Create task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Testing task creation'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
})

test('Get tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Fail userTwo delete userOne task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)
    const task = Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})