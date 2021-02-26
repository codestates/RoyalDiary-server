declare global { //익스프레스에 커스텀 속성을 전역으로 선언하는 코드
    namespace Express {
        interface Request {
        mobile: string;
        email: string;
        password: string;
        nickname: string;
        name: string;
        }
    }
    }