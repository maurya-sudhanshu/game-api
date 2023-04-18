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
              referral_id: result[0].referral_id,
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
          "call Register(?,?,?)",
          [req.body.mobile, req.body.name, ((req.body.refferby == undefined) ? ("") : (req.body.refferby))],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).json({
                error: false,
                status: true,
                balance: 0,
                referral_id: result[0][0].referral_id,
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
app.post("/get-match", verifytoken, (req, res) => {
  con.query("SELECT m.id,t1.team_name as team1_name,t1.short_name as short1_name,t1.icons as t1icon,t2.team_name as team2_name,t2.short_name  as short2_name,t2.icons as t2icon,s.icons as sicons,s.series_name,s.icons as sicons,m.status,(IF(DATEDIFF(m.match_date,CURDATE())=0, 'T',  IF(DATEDIFF(m.match_date,CURDATE())>0, 'U', 'P'))) as match_status,m.match_date FROM `match` as m INNER join teams as t1 on m.team1_id = t1.id INNER join teams as t2 on m.team2_id = t2.id INNER join series as s on s.id = m.series_id", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(result);
    }
  });
});
app.post("/get-match-up", verifytoken, (req, res) => {
  con.query("SELECT m.id,t1.team_name as team1_name,t1.short_name as short1_name,t1.icons as t1icon,t2.team_name as team2_name,t2.short_name  as short2_name,t2.icons as t2icon,s.series_name,m.status,(IF(DATEDIFF(m.match_date,CURDATE())=0, 'T',  IF(DATEDIFF(m.match_date,CURDATE())>0, 'U', 'P'))) as match_status,m.match_date FROM `match` as m INNER join teams as t1 on m.team1_id = t1.id INNER join teams as t2 on m.team2_id = t2.id INNER join series as s on s.id = m.series_id WHERE CAST(`match_date` AS DATE) > curdate();", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(result);
    }
  });
});
app.post("/get-match-p", verifytoken, (req, res) => {
  con.query("SELECT m.id,t1.team_name as team1_name,t1.short_name as short1_name,t1.icons as t1icon,t2.team_name as team2_name,t2.short_name  as short2_name,t2.icons as t2icon,s.series_name,m.status,(IF(DATEDIFF(m.match_date,CURDATE())=0, 'T',  IF(DATEDIFF(m.match_date,CURDATE())>0, 'U', 'P'))) as match_status,m.match_date FROM `match` as m INNER join teams as t1 on m.team1_id = t1.id INNER join teams as t2 on m.team2_id = t2.id INNER join series as s on s.id = m.series_id WHERE CAST(`match_date` AS DATE) < curdate();", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(result);
    }
  });
});
app.post("/get-match-t", verifytoken, (req, res) => {
  con.query("SELECT m.id,t1.team_name as team1_name,t1.short_name as short1_name,t1.icons as t1icon,t2.team_name as team2_name,t2.short_name  as short2_name,t2.icons as t2icon,s.series_name,m.status,(IF(DATEDIFF(m.match_date,CURDATE())=0, 'T',  IF(DATEDIFF(m.match_date,CURDATE())>0, 'U', 'P'))) as match_status,m.match_date FROM `match` as m INNER join teams as t1 on m.team1_id = t1.id INNER join teams as t2 on m.team2_id = t2.id INNER join series as s on s.id = m.series_id WHERE CAST(`match_date` AS DATE) = curdate();", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(result);
    }
  });
});
app.post("/get-match-prediction", verifytoken, (req, res) => {
  con.query("SELECT (SELECT `team_name` FROM `teams` WHERE `id` = m.team1_id) as team1_name,(SELECT `short_name` FROM `teams` WHERE `id` = m.team1_id) as team1_sname,(SELECT `team_name` FROM `teams` WHERE `id` = m.team2_id) as team2_name,(SELECT `short_name` FROM `teams` WHERE `id` = m.team2_id) as team2_sname,(SELECT `series_type` FROM `series` WHERE `id` = m.series_id) as series_type,(SELECT `series_name` FROM `series` WHERE `id` = m.series_id) as series_name,mp.pre_question,mp.pre_answer,mp.status,m.match_date FROM `match_prediction` as mp INNER join `match` as m on mp.match_id = m.id WHERE `match_id` = ?",[req.body.match_id], (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(result);
    }
  });
});
app.post("/get-total-share", verifytoken, (req, res) => {
  con.query("SELECT COUNT(*) as total_reffer,(if(COUNT(*) = 5,'Y','N')) as reffed FROM `user_details` WHERE `reffer_by` = (SELECT `referral_id` FROM `user_details` WHERE `user_name` = ?)",[req.body.mobile], (err, result) => {
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

app.post("/get-current-time", verifytoken, (req, res) => {
  res.send({ error: false, status: true, currentTime: new Date() });
});

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
