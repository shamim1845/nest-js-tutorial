import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getUsers(): [object] {
    return [
        {
            msg: "sucess",
            status:200,
            data: [
                {
                    id:1,
                    name:"shamim"
                },
                {
                    id:2,
                    name:"shakib"
                },
                {
                    id:3,
                    name:"sohel"
                },
                {
                    id:4,
                    name:"ahsan"
                },
            ]
        }
    ]
  }
}
