'use strict';
process.env.MONG_URI = 'mongodb://localhost/charityApp_test';
require('../index');

var chai = require('chai'),
    chaihttp = require('chai-http'),
    expect = chai.expect,
    Chance = require('chance'),
    chance = new Chance(),
    serverUrl = 'localhost:3000/api/v1',
    mongoose = require('mongoose');

chai.use(chaihttp);

function getRandomOrganizerObject() {

    var typeOfOrganizer = ['animal', 'education', 'Christian', 'homelessness'];
    return {
        email: chance.string(10) + '@' + chance.string(5) + '.com',
        orgName: chance.string(15),
        firstname: chance.string(15),
        lastname: chance.string(15),
        type: typeOfOrganizer[chance.natural({min: 0, max: typeOfOrganizer.length - 1})], // type of organization
        mission: chance.paragraph({sentences: 3}),
        address: getRandomAddress(),
        city: chance.string(9),
        phone: chance.phone(),
        website: chance.url(),
        createdSince: new Date().toJSON(),
        events: [chance.string(15), chance.string(15)]
    };
}

function getRandomAddress() {
    return chance.address() + ' ' + chance.state() + ' ' + chance.zip();
}


function getRandomUser() {
    var types = ['volunteer', 'organizer'];
    return {
        basic: {
            email: chance.string(10) + '@' + chance.string(5) + '.com',
            password: chance.string(30),

        },
        role: types[chance.natural({min: 0, max: types.length - 1})]
    }
}

function getRandomVolunteerAndProfile() {
    var user = getRandomUser();
    var profileInfo = getRandomVolunteerObject();
    profileInfo.email = user.email;
    return {
        credential: user,
        profileInfo: profileInfo
    }

}

function getRandomVolunteerObject() {
    var typeOfCauses = ['animal', 'education', 'Christian', 'homelessness'];
    return {
        email: chance.string(10) + '@' + chance.string(5) + '.com',
        name: {
            firstname: chance.string(15),
            lastname: chance.string(15)
        },
        age18: 'yes',
        address: getRandomAddress(),
        aboutme: chance.paragraph({sentences: 2}),
        causes: [typeOfCauses[chance.natural({min: 0, max: typeOfCauses.length - 1})]], // type of causes        skills: [chance.string(15)],
        skills: [chance.string(15)],
        events: [chance.string(15)]
    };
}

function getRandomEvent() {
    return {
        eventId: chance.string(20),
        organizerId: chance.string(15),
        volunteerId: chance.string(15),
        title: chance.string(50),
        date: new Date().toJSON(),
        time: new Date().toJSON(),
        location: chance.string(10),
        description: chance.paragraph({sentences: 2}),
        volunteerJobs: [{
            title: chance.string(),
            number: chance.integer(),
            skills: [chance.string(5)]
        }, {
            title: chance.string(),
            number: chance.integer(),
            skills: [chance.string(5)]
        }],
        messages: [{
            username: chance.string(5),
            body: chance.paragraph({sentences: 1}),
            date: new Date().toJSON()
        }, {
            username: chance.string(5),
            body: chance.paragraph({sentences: 1}),
            date: new Date().toJSON()
        }],
        createdSince: new Date().toJSON(),
        closed: chance.bool()
    }
}

describe('volunteers api end points', function () {
    var token,


        userObjectA = getRandomVolunteerAndProfile(),
        userObjectB = getRandomVolunteerAndProfile(),
        userObjectC = getRandomVolunteerAndProfile(),
        userObjectD = getRandomVolunteerAndProfile(),
        userObjectE = getRandomVolunteerAndProfile();

    userObjectA.credential.basic.email = '123@abc.com';
    userObjectA.profileInfo.email = '123@abc.com';
    userObjectA.credential.basic.password = '12345';


    after(function (done) {
        mongoose.connection.db.dropDatabase(function () {
            done();
        });
    });

    it('should create a volunteer user and return a token', function (done) {
        console.log(JSON.stringify(userObjectA));
        chai.request(serverUrl)
            .post('/create_user_volunteer')
            .send(userObjectA)
            .end(function (err, res) {
                expect(err).to.eql(null);
                expect(res.body).to.have.property('token')
                var returnInfo = res.body;
                delete returnInfo.profileInfo._id;
                delete returnInfo.profileInfo.__v;

                expect(returnInfo.profileInfo).to.deep.eql(userObjectA.profileInfo);
                done();
            })
    });


});