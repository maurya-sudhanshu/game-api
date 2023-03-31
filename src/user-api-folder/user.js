const express = require("express");
const app = express.Router();
const con = require("../db/conn");
var jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(cors());
require("dotenv").config();
const bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
var multer = require("multer");
app.use(bodyParser.json({ limit: "50mb" }));
var cron = require("node-cron");
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image/deposit");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".png");
  },
});
const upload = multer({ storage: storage });
app.get("/gett", (req, res) => {
  res.send("Hello")
})
app.post("/register", (req, res) => {
  con.query(
    "select * from user_details where `user_name`=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(200).json({
          error: true,
          status: false,
          message: "Mobile Number is Already Exist",
        });
      } else {
        con.query("SELECT (IFNULL(MAX(uid),100000)) as id FROM user_details", (err, ides) => {
          if (err) throw err;
          if (result) {
            const hash = bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(12)
            );
            con.query(
              "INSERT INTO `user_details`(`user_name`, `password`,`uid`) VALUES (?,?,?)",
              [req.body.mobile, hash, parseInt(ides[0].id) + 1],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  con.query(
                    "INSERT INTO `wallet`(`user_name`, `wallet_balance`) VALUES (?,?)",
                    [req.body.mobile, 0]
                  );
                  res.status(200).json({
                    error: false,
                    status: true,
                    message: "Registered Successfully",
                  });
                }
              }
            );
          }
        });
      }
    }
  );
});
app.post("/login", (req, res) => {
  con.query(
    "select * from user_details where user_name=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        var token = jwt.sign(
          { username: result[0].user_name },
          process.env.SECRET_KEY_USER, { expiresIn: '365d' },
        );
        con.query("UPDATE `user_details` SET `device_logged_in`='Y' WHERE `user_name` = ?", [req.body.mobile])
        con.query(
          "SELECT * FROM `wallet` WHERE user_name=?",
          [req.body.mobile],
          (err, balance) => {
            res.status(200).json({
              error: false,
              status: true,
              balance: balance[0].wallet_balance,
              username: result[0].user_name,
              token,
            });
          }
        );
      } else {
        var token = jwt.sign(
          { username: req.body.mobile },
          process.env.SECRET_KEY_USER, { expiresIn: '365d' },
        );
        con.query(
          "INSERT INTO `user_details`(`name`,`user_name`) VALUES (?,?)",
          [req.body.name,req.body.mobile],
          (err, result) => {
            if (err) throw err;
            if (result) {
              con.query(
                "INSERT INTO `wallet`(`user_name`, `wallet_balance`) VALUES (?,?)",
                [req.body.mobile, 0]
              );
              res.status(200).json({
                error: false,
                status: true,
                balance: 0,
                username: req.body.mobile,
                token,
              });
            }
          }
        );
      }
    }
  );
});
app.post("/logout", (req, res) => {
  con.query("UPDATE `user_details` SET `device_logged_in`='N' WHERE `user_name` = ?", [req.body.mobile], (err, result) => {
    if (err) { throw err; }
    if (result) {
      res.status(200).send({ error: false, status: true })
    }
  })
});

app.post("/get-play", verifytoken, (req, res) => {
  con.query("SELECT * FROM `play_button`", (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).send({ data: result });
    }
  });
})
app.post("/change", verifytoken, (req, res) => {
  con.query(
    "select * from user_details where mobile=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        const status = bcrypt.compareSync(
          req.body.password,
          result[0].password
        );
        if (status == true) {
          const hash = bcrypt.hashSync(
            req.body.new_password,
            bcrypt.genSaltSync(12)
          );
          con.query(
            "UPDATE `user_details` SET `password`=? WHERE `mobile`=?",
            [hash, req.body.mobile],
            (err, result) => {
              if (err) throw err;
              if (result) {
                res.status(200).json({
                  error: false,
                  status: true,
                  message: "Reset Password Successfully",
                });
              }
            }
          );
        } else {
          res.status(200).json({
            error: true,
            message: "Password is Wrong",
          });
        }
      }
    }
  );
});
app.post("/wallet-balance", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `wallet` WHERE user_name=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).json({
          error: false,
          status: "Success",
          data: result
        });
      }
    }
  );
});
app.post("/withdrawal-balace", (req, res) => {
  con.query(
    "SELECT `wallet_balance` FROM `wallet` WHERE user_name=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        con.query(
          "UPDATE `wallet` SET `wallet_balance`=?, WHERE mobile=?",
          req.body.wallet,
          (err, result) => {
            if (err) {
              throw err;
            }
            if (result.length > 0) {
              res.status(200).json({
                error: false,
                status: true,
                msg: "your wallet is update",
              });
            } else {
              res.status(403).json({
                error: false,
                status: true,
                msg: "your wallet is not a update",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-game-type", verifytoken, (req, res) => {
  con.query("select * from `game_type`", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});
app.post("/get-otp", (req, res) => {
  const val = Math.floor(1000 + Math.random() * 9000);
  const hash = bcrypt.hashSync(val.toString(), bcrypt.genSaltSync(12));
  con.query(
    "SELECT * FROM `otp` WHERE `number`=?",
    [req.body.number],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        con.query(
          "UPDATE `otp` SET `otp`=? WHERE `number`=?",
          [hash, req.body.number],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).json({
                number: req.body.number,
                otp: val.toString(),
              });
            }
          }
        );
      } else {
        con.query(
          "INSERT INTO `otp`(`otp`, `number`) VALUES (?,?)",
          [hash, req.body.number],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).json({
                number: req.body.number,
                otp: val.toString(),
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-record-complete", verifytoken, (req, res) => {
  // if(req.body.page === 0){
  let limit = 10;
  let offset = limit * req.body.page - limit;
  con.query(
    "SELECT r.* ,(SELECT COUNT(*)  FROM `record` WHERE `status` = 'Y' and `game_type` = ?) as count,(SELECT code from game_color WHERE id= gm.color_id) as color_code FROM `record` as r  INNER JOIN game_number as gn on r.number = gn.number INNER join game_mapping as gm on gm.number_id = gn.id and gm.game_type_id = r.game_type WHERE r.`status` = 'Y' and r.`game_type` = ?  GROUP by r.period ORDER BY id DESC LIMIT ? OFFSET ?",
    [req.body.id, req.body.id, limit, offset],
    (err, result) => {
      if (err) throw err;
      if (result) {
        // orders = result;
        // const grouped = {};

        // for (const {
        //   color_code,
        //   count,
        //   date,
        //   status,
        //   end_date,
        //   start_date,
        //   game_type,
        //   number,
        //   price,
        //   period,
        //   id,
        // } of orders) {
        //   const userGroup = (grouped[period] ??= {
        //     count,
        //     date,
        //     status,
        //     end_date,
        //     start_date,
        //     game_type,
        //     number,
        //     price,
        //     period,
        //     id,
        //     orders: {},
        //   });
        //   const bookGroup = (userGroup.orders[color_code] ??= { color_code });
        // }

        // newdata = Object.values(grouped).map(({ orders, ...rest }) => ({
        //   ...rest,
        //   orders: Object.values(orders),
        // }));
        // console.log(limit);
        // console.log(newdata.length);
        res.status(200).json({
          error: false,
          status: true,
          data: result,
        });
      }
    }
  );
  // }else{
  //     con.query(
  //       "SELECT * FROM `record` WHERE `status` = 'Complete' ORDER BY id DESC LIMIT 10 OFFSET ?",[parseInt(req.body.page)*10],
  //       (err, result) => {
  //         if (err) throw err;
  //         if (result) {
  //           res.status(200).json({
  //             error: false,
  //             status: true,
  //             data: result,
  //           });
  //         }
  //       }
  //     );
  // }
});
app.post("/get-record-not-complete", verifytoken, (req, res) => {
  // console.log(req.body);
  con.query(
    "SELECT `period`,`game_type`, `start_date`, `end_date` FROM `record` WHERE `status` = 'N' and `game_type` = ?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).json({
          error: false,
          status: true,
          data: result,
        });
      }
    }
  );
});
app.post("/verify-otp", (req, res) => {
  con.query(
    "SELECT * FROM `otp` where number=?",
    [req.body.number],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        const match = bcrypt.compareSync(req.body.otp, result[0].otp);
        if (match == true) {
          res.status(200).json({
            error: false,
            status: true,
            msg: "Verify OTP",
          });
        } else {
          res.status(404).json({
            error: true,
            status: false,
            msg: "Wrong OTP",
          });
        }
      } else {
        res.status(200).json({
          error: true,
          status: false,
          msg: "number is not exist",
        });
      }
    }
  );
});
app.post("/get-game-mapping-number", verifytoken, (req, res) => {
  con.query(
    "SELECT gm.id, gt.id as game_type, gc.code as color_code, gn.number as number FROM game_mapping gm INNER JOIN game_color gc ON gc.id = gm.color_id INNER JOIN game_number gn ON gn.id = gm.number_id INNER JOIN game_type gt ON gt.id = gm.game_type_id where game_type_id=? ORDER BY CAST(number AS UNSIGNED INTEGER);",
    [req.body.id],
    (err, result_data) => {
      if (err) throw err;
      if (result_data) orders = result_data;
      const grouped = {};

      for (const {
        color_code,
        color_name,
        date,
        for_color_or_number,
        game_type,
        id,
        number,
        status,
      } of orders) {
        const userGroup = (grouped[number] ??= {
          number,
          color_name,
          date,
          for_color_or_number,
          game_type,
          id,
          status,
          orders: {},
        });
        const bookGroup = (userGroup.orders[color_code] ??= { color_code });
      }

      newdata = Object.values(grouped).map(({ orders, ...rest }) => ({
        ...rest,
        orders: Object.values(orders),
      }));

      res.status(200).send(newdata);
    }
  );
});
app.post("/get-game-mapping-color", verifytoken, (req, res) => {
  con.query(
    "SELECT gm.id, gm.for_color_or_number,gt.id as game_type,gc.name as color_name,gc.code as color_code ,gm.status , gm.date FROM game_mapping gm INNER JOIN game_color gc ON gc.id =  gm.color_id INNER JOIN game_type gt ON gt.id =  gm.game_type_id where gm.for_color_or_number='only_color' and game_type_id = ?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) res.status(200).send(result);
    }
  );
});
app.post("/get-pay-method", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `payment_method` WHERE status = 'y'",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result)
        res.status(200).send({
          error: false,
          status: true,
          data: result,
        });
    }
  );
});
app.post("/get-pay-deatils", verifytoken, (req, res) => {
  con.query(
    "SELECT cpd.id,cpm.name as pname,cpd.name,cpd.UPI_id,cpd.QR_code,cpd.bank_name,cpd.account_no,cpd.ifsc_code,cpd.account_type,cpm.icon,cpd.status,cpd.date FROM colorgame.`payment_details` as cpd inner join colorgame.payment_method as cpm on cpd.paymethod_id = cpm.id where cpd.status = 'Y' and cpd.paymethod_id=?;",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result)
        res.status(200).send({
          error: false,
          status: true,
          data: result,
        });
    }
  );
});
app.post("/user-details", verifytoken, (req, res) => {
  con.query(
    "SELECT cw.id, cw.user_name, cw.wallet_balance, cw.winning_wallet, cw.Bonus_wallet, cu.uid, cu.status, cu.date FROM colorgame.wallet cw join colorgame.user_details cu on cw.user_name = cu.user_name  where cw.user_name = ? order by id;",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).json({
          error: false,
          stutus: true,
          data: result,
        });
      }
    }
  );
});

// bet-record
app.post("/get-bet-record", verifytoken, (req, res) => {
  let limit = 10;
  let offset = limit * req.body.page - limit;
  con.query(
    "SELECT bt.`id`,bt.`Period`,bt.`game-type`,bt.`price`,bt.`type`,bt.`value`, bt.if_open_zero,(SELECT code from game_color where id = gm.color_id)as color,(SELECT COUNT(*) FROM `bet-table` WHERE `username`=? and `game-type` = ?) as count,(SELECT `number` FROM `record` WHERE `period` = bt.`Period` and `game_type` = bt.`game-type` LIMIT 1 OFFSET 0) as number,(SELECT (SELECT (SELECT (SELECT gc.name FROM game_color as gc WHERE gc.id = gmin.color_id) FROM game_mapping as gmin WHERE gmin.number_id = gnum.id AND gmin.game_type_id = r.game_type ORDER BY gmin.id ASC LIMIT 1) from game_number as gnum WHERE gnum.number = r.number) FROM `record` as r WHERE r.`period` = bt.`Period` and r.`game_type` = bt.`game-type` LIMIT 1 OFFSET 0) as open_color,(SELECT `winning-amount` FROM `record` WHERE `period` = bt.`Period` and `game_type` = bt.`game-type` LIMIT 1 OFFSET 0) as winning_amount FROM `bet-table` as bt INNER JOIN game_mapping as gm on bt.value_id = gm.id WHERE bt.`username` = ? and bt.`game-type` = ? ORDER by id DESC LIMIT ? OFFSET ?;",
    [req.body.mobile, req.body.id, req.body.mobile, req.body.id, limit, offset],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).json({
          error: false,
          status: true,
          data: result,
        });
      }
    }
  );
});
app.post("/add-bet-details", (req, res) => {
  if (req.body.bonuscheck == true) {
    let value = parseInt(req.body.total_amount) - (parseInt(req.body.total_amount) / 10);
    con.query(
      "SELECT IF(`wallet_balance` + `Winning_wallet` + (IF(`Bonus_wallet` >= ?,?, 0)) >= ?,IF(wallet_balance >= ?,'true',wallet_balance),'wfalse') AS result FROM wallet WHERE `user_name` = ?;",
      [(parseInt(req.body.total_amount) / 10), (parseInt(req.body.total_amount) / 10), parseInt(req.body.total_amount), value, req.body.mobile],
      (error, result) => {
        if (error) {
          throw error;
        }
        if (result[0].result === "wfalse") {
          res.status(302).send({
            error: true,
            status: false,
            massage: "Insufficient Balance in your Account",
          });
        } else if (result[0].result === "true") {
          con.query(
            "UPDATE `wallet` SET `wallet_balance`= `wallet_balance` - ?,`Bonus_wallet`=`Bonus_wallet`-? WHERE `user_name`=?",
            [value, (parseInt(req.body.total_amount) / 10), req.body.mobile],
            (err, resultt) => {
              if (err) throw err;
              if (resultt) {
                con.query(
                  "INSERT INTO `bet-table`(`Period`, `username`, `price`, `type`, `winning-amount`, `if_open_zero`, `value`,`value_id`, `game-type`, `term_condition`) VALUES (?,?,?,?,(SELECT `multiple` FROM `game_mapping` WHERE `id`=?)*?,(SELECT `if_open_zero` FROM `game_mapping` WHERE `id`=?)*?,?,?,?,'Y')",
                  [
                    req.body.period,
                    req.body.mobile,
                    req.body.total_amount,
                    req.body.method,
                    req.body.id,
                    req.body.total_amount,
                    req.body.id,
                    req.body.total_amount,
                    req.body.select,
                    req.body.id,
                    req.body.game_type,
                  ],
                  (err, resultt) => {
                    if (err) throw err;
                    if (resultt) {
                      con.query("INSERT INTO `statement`(`username`,`bet_or_type`,`period`,`Select`,`bet_from`, `bet_balance`, `total_balance`,`status`) VALUES (?,(SELECT `name` FROM `game_type` WHERE `id` =?),?,?,'Deposit Wallet & Bonus Wallet',?,(SELECT (`wallet_balance`+`Winning_wallet`+`Bonus_wallet`) as balance FROM `wallet` WHERE `user_name`= ?),'Bet Add')",
                        [
                          req.body.mobile,
                          req.body.game_type,
                          req.body.period,
                          req.body.select,
                          req.body.total_amount,
                          req.body.mobile
                        ],
                        (errr, resu) => {
                          if (errr) {
                            throw errr;
                          }
                          if (resu) {
                            res.status(200).send({
                              error: false,
                              status: true,
                            });
                          }
                        })
                    }
                  }
                );
              }
            }
          );
        } else {
          let WB = value - result[0].result;
          con.query(
            "UPDATE `wallet` SET `wallet_balance`=`wallet_balance`- ?,`Winning_wallet`=`Winning_wallet`- ?,`Bonus_wallet`= `Bonus_wallet` - ? WHERE `user_name` = ?",
            [parseInt(result[0].result), WB, (parseInt(req.body.total_amount) / 10), req.body.mobile],
            (err, resultt) => {
              if (err) throw err;
              if (resultt) {
                con.query(
                  "INSERT INTO `bet-table`(`Period`, `username`, `price`, `type`, `winning-amount`, `if_open_zero`, `value`,`value_id`, `game-type`, `term_condition`) VALUES (?,?,?,?,(SELECT `multiple` FROM `game_mapping` WHERE `id`=?)*?,(SELECT `if_open_zero` FROM `game_mapping` WHERE `id`=?)*?,?,?,?,'Y')",
                  [
                    req.body.period,
                    req.body.mobile,
                    req.body.total_amount,
                    req.body.method,
                    req.body.id,
                    req.body.total_amount,
                    req.body.id,
                    req.body.total_amount,
                    req.body.select,
                    req.body.id,
                    req.body.game_type,
                  ],
                  (err, resultt) => {
                    if (err) throw err;
                    if (resultt) {
                      con.query("INSERT INTO `statement`(`username`,`bet_or_type`,`period`,`Select`,`bet_from`, `bet_balance`, `total_balance`,`status`) VALUES (?,(SELECT `name` FROM `game_type` WHERE `id` =?),?,?,'Deposit Wallet & Bonus Wallet',?,(SELECT (`wallet_balance`+`Winning_wallet`+`Bonus_wallet`) as balance FROM `wallet` WHERE `user_name`= ?),'Bet Add')",
                        [
                          req.body.mobile,
                          req.body.game_type,
                          req.body.period,
                          req.body.select,
                          req.body.total_amount,
                          req.body.mobile
                        ],
                        (errr, resu) => {
                          if (errr) {
                            throw errr;
                          }
                          if (resu) {
                            res.status(200).send({
                              error: false,
                              status: true,
                            });
                          }
                        })
                    }
                  }
                );
              }
            }
          );
        }
      }
    )
  } else {
    con.query(
      "SELECT IF(`wallet_balance` + `Winning_wallet` >= ?,IF(wallet_balance >= ?,'true',wallet_balance),'wfalse') AS result FROM wallet WHERE `user_name` = ?;",
      [parseInt(req.body.total_amount), parseInt(req.body.total_amount), req.body.mobile],
      (error, result) => {
        if (error) {
          throw error;
        }
        if (result[0].result === "wfalse") {
          res.status(302).send({
            error: true,
            status: false,
            massage: "Insufficient Balance in your Account",
          });
        } else if (result[0].result === "true") {
          con.query(
            "UPDATE `wallet` SET `wallet_balance`= `wallet_balance` - ? WHERE `user_name`=?",
            [parseInt(req.body.total_amount), req.body.mobile],
            (err, resultt) => {
              if (err) throw err;
              if (resultt) {
                con.query(
                  "INSERT INTO `bet-table`(`Period`, `username`, `price`, `type`, `winning-amount`, `if_open_zero`, `value`,`value_id`, `game-type`, `term_condition`) VALUES (?,?,?,?,(SELECT `multiple` FROM `game_mapping` WHERE `id`=?)*?,(SELECT `if_open_zero` FROM `game_mapping` WHERE `id`=?)*?,?,?,?,'Y')",
                  [
                    req.body.period,
                    req.body.mobile,
                    req.body.total_amount,
                    req.body.method,
                    req.body.id,
                    req.body.total_amount,
                    req.body.id,
                    req.body.total_amount,
                    req.body.select,
                    req.body.id,
                    req.body.game_type,
                  ],
                  (err, resultt) => {
                    if (err) throw err;
                    if (resultt) {
                      con.query("INSERT INTO `statement`(`username`,`bet_or_type`,`period`,`Select`,`bet_from`, `bet_balance`, `total_balance`,`status`) VALUES (?,(SELECT `name` FROM `game_type` WHERE `id` =?),?,?,'Deposit Wallet & Bonus Wallet',?,(SELECT (`wallet_balance`+`Winning_wallet`+`Bonus_wallet`) as balance FROM `wallet` WHERE `user_name`= ?),'Bet Add')",
                        [
                          req.body.mobile,
                          req.body.game_type,
                          req.body.period,
                          req.body.select,
                          req.body.total_amount,
                          req.body.mobile
                        ],
                        (errr, resu) => {
                          if (errr) {
                            throw errr;
                          }
                          if (resu) {
                            res.status(200).send({
                              error: false,
                              status: true,
                            });
                          }
                        })
                    }
                  }
                );
              }
            }
          );
        } else {
          con.query(
            "UPDATE `wallet` SET `wallet_balance`=`wallet_balance`- ?,`Winning_wallet`=`Winning_wallet`- ? WHERE `user_name` = ?",
            [parseInt(result[0].result), (parseInt(req.body.total_amount) - parseInt(result[0].result)), req.body.mobile],
            (err, resultt) => {
              if (err) throw err;
              if (resultt) {
                con.query(
                  "INSERT INTO `bet-table`(`Period`, `username`, `price`, `type`, `winning-amount`, `if_open_zero`, `value`,`value_id`, `game-type`, `term_condition`) VALUES (?,?,?,?,(SELECT `multiple` FROM `game_mapping` WHERE `id`=?)*?,(SELECT `if_open_zero` FROM `game_mapping` WHERE `id`=?)*?,?,?,?,'Y')",
                  [
                    req.body.period,
                    req.body.mobile,
                    req.body.total_amount,
                    req.body.method,
                    req.body.id,
                    req.body.total_amount,
                    req.body.id,
                    req.body.total_amount,
                    req.body.select,
                    req.body.id,
                    req.body.game_type,
                  ],
                  (err, resultt) => {
                    if (err) throw err;
                    if (resultt) {
                      con.query("INSERT INTO `statement`(`username`,`bet_or_type`,`period`,`Select`,`bet_from`, `bet_balance`, `total_balance`,`status`) VALUES (?,(SELECT `name` FROM `game_type` WHERE `id` =?),?,?,'Deposit Wallet & Bonus Wallet',?,(SELECT (`wallet_balance`+`Winning_wallet`+`Bonus_wallet`) as balance FROM `wallet` WHERE `user_name`= ?),'Bet Add')",
                        [
                          req.body.mobile,
                          req.body.game_type,
                          req.body.period,
                          req.body.select,
                          req.body.total_amount,
                          req.body.mobile
                        ],
                        (errr, resu) => {
                          if (errr) {
                            throw errr;
                          }
                          if (resu) {
                            res.status(200).send({
                              error: false,
                              status: true,
                            });
                          }
                        })
                    }
                  }
                );
              }
            }
          );
        }
      }
    )
  }
});

// Deposit Details
app.post(
  "/deposit-request",
  upload.single("d_image"),
  verifytoken,
  (req, res) => {
    con.query(
      "select * from deposit where transaction_id=?",
      [req.body.transaction_id],
      (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          res.status(302).json({
            error: true,
            stutus: false,
            massage: "Wrong Transaction Deatils",
          });
        } else {
          con.query(
            "select cpd.id from colorgame.payment_details as cpd inner join colorgame.payment_method as cpm on cpd.paymethod_id = cpm.id where cpd.status = 'Y' and cpm.name = ?;",
            [req.body.pay_method],
            (err, pay) => {
              if (err) throw err;
              if (pay.length > 0) {
                con.query(
                  "INSERT INTO `deposit`(`user_name`, `balance`, `image`, `transaction_id`, `payment`,`paymethod_id`) VALUES (?,?,?,?,?,?)",
                  [
                    req.body.mobile,
                    req.body.balance,
                    req.file.filename,
                    req.body.transaction_id,
                    req.body.pay_method,
                    pay[0].id,
                  ],
                  (err, result) => {
                    if (err) throw err;
                    if (result) {
                      res.status(201).json({
                        error: false,
                        status: true,
                        massage: "Add Deposit Request",
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }
);
app.post("/get-deposit-request", verifytoken, (req, res) => {
  if (req.body.status === "Pending") {
    con.query(
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id WHERE cd.`status` = 'Pending' and cd.`user_name`=?;",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({
            error: false,
            status: true,
            data: result,
          });
        }
      }
    );
  } else if (req.body.status === "Success") {
    con.query(
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id WHERE cd.`status` = 'Success' and cd.`user_name`=?;",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({
            error: false,
            status: true,
            data: result,
          });
        }
      }
    );
  } else if (req.body.status === "Canceled") {
    con.query(
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id WHERE cd.`status` = 'Canceled' and cd.`user_name`=?;",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({
            error: false,
            status: true,
            data: result,
          });
        }
      }
    );
  } else {
    con.query(
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id where cd.`user_name`=?;",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({
            error: false,
            status: true,
            data: result,
          });
        }
      }
    );
  }
});

//Bank Deatils
app.post("/add-bankdetails", verifytoken, (req, res) => {
  con.query(
    "select * from userbankdeatils where account_no=?",
    [req.body.account_no],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(302).send({
          error: true,
          status: false,
          massage: "Account No is already exist",
        });
      } else {
        con.query(
          "INSERT INTO `userbankdeatils`(`username`, `account_no`, `ifsc_code`, `account_holder_name`, `bankname`, `account_type`) VALUES (?,?,?,?,?,?)",
          [
            req.body.mobile,
            req.body.account_no,
            req.body.ifsc,
            req.body.name,
            req.body.bankname,
            req.body.account_type,
          ],
          (errr, resultt) => {
            if (errr) throw errr;
            if (resultt) {
              res.status(201).send({
                error: false,
                status: true,
                massage: "Add bank deatils, Wait for Varification",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-bankdetails", verifytoken, (req, res) => {
  con.query(
    "SELECT `id`, `username`, `account_no`, `ifsc_code`, `account_holder_name`, `bankname`, `account_type`, `status`,`reason`, `date` FROM `userbankdeatils` WHERE `username`=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send({ error: false, status: true, data: result });
      }
    }
  );
});
app.post("/delete-bankdetails", verifytoken, (req, res) => {
  con.query(
    "DELETE FROM `userbankdeatils` WHERE `id`=?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res
          .status(200)
          .send({ error: false, status: true, massge: "Deleted Successfully" });
      }
    }
  );
});

//number Deatils
app.post("/add-numberdetails", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `usernumberdetails` WHERE `number` = ? and `type`=?",
    [req.body.number, req.body.type],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(302).send({
          error: true,
          status: false,
          massage: "Mobile No is already exist",
        });
      } else {
        con.query(
          "INSERT INTO `usernumberdetails`(`username`, `name`, `type`, `number`) VALUES (?,?,?,?)",
          [req.body.mobile, req.body.name, req.body.type, req.body.number],
          (errr, resultt) => {
            if (errr) throw errr;
            if (resultt) {
              res.status(201).send({
                error: false,
                status: true,
                massage: "Added Successfully",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-numberetails", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `usernumberdetails` WHERE `username`=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send({ error: false, status: true, data: result });
      }
    }
  );
});
app.post("/delete-numberetails", verifytoken, (req, res) => {
  con.query(
    "DELETE FROM `usernumberdetails` WHERE `id`=?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res
          .status(200)
          .send({ error: false, status: true, massge: "Deleted Successfully" });
      }
    }
  );
});

//UPI Details
app.post("/add-upidetails", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `userupidetails` WHERE `UPI_id`=?",
    [req.body.upiid],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(302).send({
          error: true,
          status: false,
          massage: "UPI Id is already exist",
        });
      } else {
        con.query(
          "INSERT INTO `userupidetails`( `username`, `name`, `UPI_id`) VALUES (?,?,?)",
          [req.body.mobile, req.body.name, req.body.upiid],
          (errr, resultt) => {
            if (errr) throw errr;
            if (resultt) {
              res.status(201).send({
                error: false,
                status: true,
                massage: "Added Successfully",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-upidetails", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `userupidetails` WHERE `username`=?",
    [req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send({ error: false, status: true, data: result });
      }
    }
  );
});
app.post("/delete-upidetails", verifytoken, (req, res) => {
  con.query(
    "DELETE FROM `userupidetails` WHERE `id`=?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res
          .status(200)
          .send({ error: false, status: true, massge: "Deleted Successfully" });
      }
    }
  );
});

//withdrawal Deatils
app.post("/add-withdrawal-request", verifytoken, (req, res) => {
  console.log(req.body);
  if (299 > parseInt(req.body.amount)) {
    res.status(302).send({
      error: true,
      status: false,
      massage: "Minimum Balance withdrawal is 300 ",
    });
  } else {
    con.query(
      "SELECT IF(`Winning_wallet` >= ?,'true','false') as result FROM wallet WHERE `user_name`=?; ",
      [parseInt(req.body.amount), req.body.mobile],
      (error, result) => {
        if (error) {
          throw error;
        }
        if (result[0].result === "true") {
          con.query(
            "UPDATE `wallet` SET `Winning_wallet`= `Winning_wallet` - ? WHERE `user_name`=?",
            [parseInt(req.body.amount), req.body.mobile],
            (err, resultt) => {
              if (err) throw err;
              if (resultt) {
                con.query(
                  "INSERT INTO `withdrawal`(`user_name`, `balance`, `paymethod_id`, `paytype`) VALUES (?,?,?,?)",
                  [
                    req.body.mobile,
                    req.body.amount,
                    req.body.id,
                    req.body.method,
                  ],
                  (err, resultt) => {
                    if (err) throw err;
                    if (resultt) {
                      res.status(200).send({
                        error: false,
                        status: true,
                        massage: "Added withdrawal Request SuccessFully",
                      });
                    }
                  }
                );
              }
            }
          );
        } else {
          res.status(302).send({
            error: true,
            status: false,
            massage: "Insufficient Balance in your Winning wallet",
          });
        }
      }
    );
  }
});
app.post("/get-withdrawal-request", verifytoken, (req, res) => {
  if (req.body.status === "Pending") {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date  FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.user_name=? and w.status='Pending'",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else if (req.body.status === "Success") {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date  FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.user_name=? and w.status='Success'",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else if (req.body.status === "Canceled") {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date  FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.user_name=? and w.status='Canceled'",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.user_name=?",
      [req.body.mobile],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  }
});
app.post("/decline-withdrawal-request", verifytoken, (req, res) => {
  con.query(
    "UPDATE `withdrawal` SET `reson`=?,`Approved_declined_By`=?,`status`='Canceled' WHERE `id`=? AND `user_name`=?",
    [req.body.reason, req.body.mobile, req.body.id, req.body.mobile],
    (err, resultt) => {
      if (err) throw err;
      if (resultt) {
        con.query(
          "UPDATE `wallet` SET `wallet_balance`=wallet_balance+(SELECT `balance` FROM `withdrawal` WHERE `id`=?) WHERE `user_name`=?;",
          [req.body.id, req.body.mobile],
          (err, resultt) => {
            if (err) throw err;
            if (resultt) {
              res.status(200).send({
                error: false,
                status: true,
                massage: "Wallet Update SuccessFully",
              });
            }
          }
        );
      }
    }
  );
});

//statement
app.post("/get-statement", verifytoken, (req, res) => {
  let limit = 10;
  let offset = limit * req.body.page - limit;
  con.query("SELECT s.id,s.bet_or_type,s.period,s.Select,s.bet_from,s.bet_balance,s.total_balance,(select COUNT(*) FROM `statement` WHERE `username` = '9794368090') as count,s.date FROM `statement` s WHERE s.`username` = ? ORDER by s.id DESC LIMIT ? OFFSET ?", [req.body.mobile, limit, offset], (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
      res.status(200).send({
        error: false,
        status: true,
        data: result
      })
    }
  })
});

app.post('/get-shopping-details', (req, res) => {
  con.query("SELECT * FROM `items` where `status` = 'Y'", (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).send({ error: false, status: true, data: result })
    }
  })
})
app.post('/add-to-cart', verifytoken, (req, res) => {
  con.query("SELECT * FROM `cart` WHERE `username` = ? and `item_id` = ?;", [req.body.mobile, req.body.i_id], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      con.query("UPDATE `cart` SET `total_item`= (? + 1) WHERE `item_id` = ? and `username` = ?", [result[0].total_item, req.body.i_id, req.body.mobile], (error, resultt) => {
        if (error) throw error;
        if (result) {
          res.status(201).send({ error: false, status: true })
        }
      })
    } else {
      con.query("INSERT INTO `cart`(`username`, `item_id`,`total_item`) VALUES (?,?,?)", [req.body.mobile, req.body.i_id, 1], (error, resultt) => {
        if (error) throw error;
        if (result) {
          res.status(201).send({ error: false, status: true })
        }
      })
    }
  })
})
app.post('/update-cart-item', verifytoken, (req, res) => {
  con.query("SELECT * FROM `cart` WHERE `username` = ? and `item_id` = ?;", [req.body.mobile, req.body.i_id], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      if (req.body.type == "max") {
        con.query("UPDATE `cart` SET `total_item`= (? + 1) WHERE `item_id` = ? and `username` = ?", [result[0].total_item, req.body.i_id, req.body.mobile], (error, resultt) => {
          if (error) throw error;
          if (resultt) {
            res.status(201).send({ error: false, status: true })
          }
        })
      }
      if (req.body.type == "min") {
        if (result[0].total_item >= 1) {
          con.query("UPDATE `cart` SET `total_item`= (? - 1) WHERE `item_id` = ? and `username` = ?", [result[0].total_item, req.body.i_id, req.body.mobile], (error, resultt) => {
            if (error) throw error;
            if (resultt) {
              res.status(201).send({ error: false, status: true });
            }
          })
        }
      }
    }
  })
})
app.post("/del-cart-item", verifytoken, (req, res) => {
  con.query(
    "DELETE FROM `cart` WHERE `username` = ? and `id` = ?",
    [req.body.mobile,req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res
          .status(200)
          .send({ error: false, status: true});
      }
    }
  );
});
app.post('/get-total-cart-item', verifytoken, (req, res) => {
  con.query("SELECT sum(total_item) as total_item FROM `cart` WHERE `username` = ? and `status`='C'", [req.body.mobile], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).send({ error: false, status: true, data: result[0].total_item })
    }
  })
})
app.post('/get-cart-item', verifytoken, (req, res) => {
  con.query("SELECT c.id,c.item_id,c.username,i.item_name,i.item_discription,i.item_image,i.item_oprice,i.item_dprice,c.total_item FROM `cart` as c INNER join items as i on c.item_id = i.id WHERE `username` = ? and c.`status` = 'C'", [req.body.mobile], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).send({ error: false, status: true, data: result })
    }
  })
})

app.post('/add-order', verifytoken, (req,res) => {
  date = new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 7)
  con.query(
    "UPDATE `cart` SET `status`='O',`order_date`= ? WHERE `username` = ? and `status` = 'C'",
    [date,req.body.mobile],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res
          .status(200)
          .send({ error: false, status: true });
      }
    }
  );
 })

app.post("/get-current-time", verifytoken, (req, res) => {
  res.send({ error: false, status: true, currentTime: new Date() });
});

// cron.schedule("*/1 * * * * *", () => {

// });
function verifytoken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRET_KEY_USER, (err, auth) => {
      if (err) {
        res.status(403).send('Token Expire');
      } else {
        if (auth.username != req.body.mobile) {
          res.status(403).send("false");
        } else {
          next();
        }
      }
    });
  } else {
    res.sendStatus(403);
  }
}
module.exports = app;
