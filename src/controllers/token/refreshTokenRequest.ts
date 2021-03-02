const {checkRefeshToken, generateAccessToken, resendAccessToken} = require('.');
const { user } = require('../../models');
import { Request, Response} from "express"

module.exports = {
    refreshToken: (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).send('refresh token not provided');
        }

        const refreshTokenData = checkRefeshToken(refreshToken);
        if (!refreshTokenData) {
            return res
            .status(202)
            .send('refresh token is outdated, pleaes log in again');
        }
        const { email } = refreshTokenData;
        user
        .findOne({ where: { email } })
        .then((data: any) => {
            if (!data) {
                return res.status(400).send('refresh token has been tempered');
            }
            delete data.dataValues.password;

            const newAccessToken = generateAccessToken(data.dataValues);
            resendAccessToken(res, newAccessToken, data.dataValues);
        })
        .catch((err: string) => {
            console.log(err);
        });
    },
};

