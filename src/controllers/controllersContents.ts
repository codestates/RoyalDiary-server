import "reflect-metadata";
import express, {Request, Response, NextFunction} from "express";
import {createConnection} from "typeorm";
import {Users} from "../entity/Users";

export = {
    userInfo : createConnection().then (async connection => {
    console.log("userInfo test");
    const user = new Users();
    user.name = "name";
    user.nickname = "nickname";
    user.password = "password";
    user.email = "email";
    user.mobile = "mobile";
    await connection.manager.save(user);
    console.log("Saved a new user with id: " + user.id);
    console.log("Loading users from the database...");
    const users = await connection.manager.find(Users);
    console.log("Loaded users: ", users);
    console.log("Here you can setup and run express/koa/any other framework.");
    })
}