const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Task = require('../src/models/task')
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

test('Signup new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'James',
            email: 'james@example.com',
            password: 'Geriatric6'
        }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull() 
    expect(response.body).toMatchObject({
        user: {
            name: 'James',
            email: 'james@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Geriatric6')
})

test('Login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Fail login non-existant user', async () => {
    await request(app)
    .post('/users/login')
        .send({
            email: 'james@example.com',
            password: 'Geriatric6'
        })
        .expect(400)
})

test('Get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Fail get profile for unauth user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete user account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Fail delete account for unauth user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Upload avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/Mt Yonah.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update user', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jimbo Fisher'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe('Jimbo Fisher')
})

test('Fail update user invalid field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            chameleon: 'This is an invalid field'
        })
        .expect(400)
})
