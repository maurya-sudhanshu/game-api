const express = require("express");
const app = express.Router();
var atob = require('atob');
var btoa = require('btoa');
const con = require("../db/conn");
const multer = require("multer");
var jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();
const bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
var cron = require("node-cron");
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use("../../image", express.static("image"));

app.delete("/del", (req, res) => {
  fs.unlink(
    "/image/banners-details/add_banner-1664302399008-677052225.png",
    function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("File has been Deleted");
      }
    }
  );
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname == "add_banner") {
      cb(null, "image/banners-details");
    } else if (file.fieldname == "add_cat") {
      cb(null, "image/catagory");
    } else if (file.fieldname == "add_sub_cat") {
      cb(null, "image/sub-catagory");
    } else if (file.fieldname == "add_slug") {
      cb(null, "image/slug");
    } else if (file.fieldname == "Add_plan_img") {
      cb(null, "image/plan");
    } else if (file.fieldname == "qr_code") {
      cb(null, "image/QR-Code");
    } else {
      cb(null, "image/buisness");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".png");
  },
});
const upload = multer({ storage: storage });


app.post("/login", (req, res) => {
  var dec = atob(req.body.data);
  req.body = JSON.parse(dec);
  con.query("select (select name from role where id = role_id) as role, (select play_btn from role where id = role_id) as playbtn from role_assign where user_id = (SELECT id FROM `login` where `username`=?);", [req.body.username], (role_err, role_result) => {
    if (role_err) throw role_err;
    if (role_result.length > 0) {
      if ("Super Admin" == role_result[0].role) {
        con.query(
          "select * from login where username = ?",
          [req.body.username],
          (err, result) => {
            if (err) throw err;
            if (result[0] != null) {
              const match = bcrypt.compareSync(
                req.body.password,
                result[0].password
              );
              if (match) {
                jwt.sign(
                  { username: result[0].username },
                  process.env.SECRET_KEY_SUPERADMIN, { expiresIn: '1h' },
                  (err, token) => {
                    if (err) throw err;
                    else
                      con.query("UPDATE `login` SET `device_logged_in`='Y' WHERE `username` = ?", [req.body.username])
                    res.status(200).json(btoa(JSON.stringify({
                      status: true,
                      username: result[0].username,
                      play: role_result[0].playbtn,
                      token,
                    })));
                  }
                );
              } else {
                res.status(401).send(btoa("Username And Password is Wrong!"));
              }
            } else {
              res.status(401).send(btoa("Username is not exist"));
            }
          }
        );
      } else {
        con.query(
          "select * from login where username = ?",
          [req.body.username],
          (err, result) => {
            if (err) throw err;
            if (result[0] != null) {
              const match = bcrypt.compareSync(
                req.body.password,
                result[0].password
              );
              if (match) {
                jwt.sign(
                  { username: result[0].username },
                  process.env.SECRET_KEY_ADMIN, { expiresIn: '1h' },
                  (err, token) => {
                    if (err) throw err;
                    else
                      con.query("UPDATE `login` SET `device_logged_in`='Y' WHERE `username` = ?", [req.body.username])
                    res.status(200).json(btoa(JSON.stringify({
                      status: true,
                      username: result[0].username,
                      play: role_result[0].playbtn,
                      token,
                    })));
                  }
                );
              } else {
                res.status(401).send(btoa("Username And Password is Wrong!"));
              }
            } else {
              res.status(401).send(btoa("Username is not exist"));
            }
          }
        );
      }
    } else {
      res.status(401).send(btoa("Unknown Error"));
    }
  })
});
app.post("/logout", (req, res) => {
  con.query("UPDATE `login` SET `device_logged_in`='N' WHERE `username` = ?", [req.body.username], (err, result) => {
    if (err) { throw err; }
    if (result) {
      res.status(200).send({ error: false, status: true })
    }
  })
});
app.post("/change", verifytoken, (req, res) => {
  con.query(
    "select * from login where username=?",
    [req.body.username],
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
            "UPDATE `login` SET `password`=? WHERE `username`=?",
            [hash, req.body.username],
            (err, result) => {
              if (err) throw err;
              if (result) {
                res.status(200).json(btoa(JSON.stringify({
                  error: false,
                  status: true,
                  message: "Reset Password Successfully",
                })));
              }
            }
          );
        } else {
          res.status(200).json(btoa(JSON.stringify({
            error: true,
            message: "Password is Wrong",
          })));
        }
      }
    }
  );
});

app.post("/add-admin", verifytoken, (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  con.query("select m.module_name FROM assign_module as am INNER join module as m on am.module = m.id WHERE am.role = (select role_id from role_assign where user_id = (SELECT id FROM `login` where `username`=?))", [req.body.username], (err, module) => {
    if (err) throw err;
    if (module) {
      const arr = module;
      const f = arr.find(element => element.module_name == 'Sub-Admin');
      if (f == undefined) {
        res.status(403).json(btoa(JSON.stringify({ error: true, status: false, massage: 'You are not Capable to Create Admin' })));
      } else {
        con.query(
          "select * from login where username = ?",
          [req.body.nusername],
          (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
              con.query(
                "INSERT INTO `login`(`name`,`username`, `password`) VALUES (?,?,?)",
                [req.body.name, req.body.nusername, hash],
                (err, result) => {
                  if (err) throw err;
                  if (result) {
                    con.query(
                      "INSERT INTO `role_assign`(`role_id`, `user_id`) VALUES (?,(select `id` from login where username = ?))",
                      [req.body.role, req.body.nusername],
                      (err, result) => {
                        if (err) throw err;
                        if(result) {
                          res.status(201).json(btoa(JSON.stringify({ error: false, status: true, massage: 'New Admin Created Successfully' })));
                        }
                      }
                    );
                  }
                }
              );
            } else {
              res.status(302).send(btoa("Username is already exist"));
            }
          }
        );
      }
    }
  })
});
app.post("/update-admin", verifytoken, (req, res) => {
  con.query("select m.module_name FROM assign_module as am INNER join module as m on am.module = m.id WHERE am.role = (select role_id from role_assign where user_id = (SELECT id FROM `login` where `username`=?))", [req.body.username], (err, module) => {
    if (err) throw err;
    if (module) {
      const arr = module;
      const f = arr.find(element => element.module_name == 'Sub-Admin');
      if (f == undefined) {
        res.status(403).json(btoa(JSON.stringify({ error: true, status: false, massage: 'You are not Capable to Create Admin' })));
      } else {
        con.query("select `id` from `login` where `username` = ?", [req.body.nusername], (err, check) => {
          if (err) throw err;
          if (check.length > 0) {
            if (check[0].id == req.body.id) {
              con.query(
                "UPDATE `login` SET `username`= ?,`name`= ? WHERE `id` = ?",
                [req.body.nusername, req.body.name, req.body.id],
                (err, result) => {
                  if (err) throw err;
                  if (result) {
                    con.query("UPDATE `role_assign` SET `role_id`=? WHERE `user_id` = ?", [req.body.role, req.body.id], (err, result) => {
                      if (err) throw err;
                      if (result) {
                        res.status(200).json(btoa(JSON.stringify({ error: false, status: true, massage: 'Admin Details Updated Successfully' })));
                      }
                    })
                  }
                }
              );
            } else {
              res.status(302).json(btoa(JSON.stringify({ error: true, status: false, massage: 'Username is already Exist' })))
            }
          } else {
            con.query(
              "UPDATE `login` SET `username`= ?,`name`= ? WHERE `id` = ?",
              [req.body.nusername, req.body.name, req.body.id],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  con.query("UPDATE `role_assign` SET `role_id`=? WHERE `user_id` = ?", [req.body.role, req.body.id], (err, result) => {
                    if (err) throw err;
                    if (result) {
                      res.status(200).json(btoa(JSON.stringify({ error: false, status: true, massage: 'Admin Details Updated Successfully' })));
                    }
                  })
                }
              }
            );
          }
        })
      }
    }
  })
});
app.post("/get-admin", verifytoken, (req, res) => {
  con.query("SELECT l.id,l.name ,l.username, (IFNULL((select role.display_name FROM role WHERE role.id = ra.role_id),'Not Assign')) as role,l.date,l.device_logged_in,l.status  FROM `login` as l LEFT JOIN role_assign as ra on l.id = ra.user_id;", (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).json(btoa(JSON.stringify({ error: false, status: true, data: result })));
    }
  })
})
app.post("/del-admin", verifytoken, (req, res) => {
  con.query("DELETE FROM `role_assign` WHERE `user_id` = ?", [req.body.id], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      con.query("DELETE FROM `login` WHERE `id` = ?", [req.body.id], (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).json(btoa(JSON.stringify({ error: false, status: true, massage: 'Your Admin has been Deleted SuccessFully' })))
        }
      })
    } else {
      con.query("DELETE FROM `login` WHERE `id` = ?", [req.body.id], (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send(btoa(JSON.stringify({ error: false, status: true, massage: 'Your Admin has been Deleted SuccessFully' })))
        }
      })
    }
  })
})

app.post("/add-activity_maping", verifytoken, (req, res) => {
  con.query(
    "select * from activity_maping where activity_name=?",
    [req.body.name],
    (err, result) => {
      if (err) throw err;
      if (result[0] == null) {
        con.query(
          "INSERT INTO `activity_maping`(`activity_name`, `active_url`,`device_logged_in`,`show_manu`) VALUES (?,?,?,?)",
          [req.body.name, req.body.url, req.body.status, req.body.manu],
          (err, result) => {
            if (err) throw err;
            if(result) {
              res.status(200).json(btoa(true));
            }
          }
        );
      } else {
        res.status(302).json(btoa("Display name is already exist"));
      }
    }
  );
});

app.post("/get-user", verifytoken, (req, res) => {
  con.query("SELECT * FROM `user`", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).json({ data: result });
    }
  });
});
app.post("/del-user", verifytoken, (req, res) => {
  con.query("DELETE FROM `user` WHERE `id` = ?", [req.body.id], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).send({ error: false, status: true, massage: 'Your User has been Deleted SuccessFully' })
    }
  })
})
app.post("/status-user", verifytoken, (req, res) => {
  con.query(
    "UPDATE `user` SET `status`=? WHERE `id` = ?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(true);
      }
    }
  );
});

app.post("/get-total-data", verifytoken, (req, res) => {
  con.query("SELECT (select IFNULL(COUNT(*), 0) from user_details) as total_user,(select IFNULL(COUNT(*), 0) from user_details WHERE device_logged_in = 'Y') as active_user,(SELECT IFNULL(SUM(balance), 0) FROM `withdrawal` WHERE status ='Success') as total_w,(SELECT IFNULL(COUNT(*),0) FROM `withdrawal` WHERE status = 'Pending') as total_wr,(SELECT IFNULL(SUM(balance), 0) FROM `deposit` WHERE status = 'Success') as total_d,(SELECT IFNULL(COUNT(*), 0) FROM `deposit` WHERE status = 'Pending') as total_dr;", (ro_err, ro_result) => {
    if (ro_err) throw ro_err;
    if (ro_result) {
      res.status(200).json(btoa(JSON.stringify({
        error: false,
        status: true,
        data: ro_result
      })))
    }
  })
});

app.post("/get-menu", verifytoken, (req, res) => {
  con.query("select role_id from role_assign where user_id = (SELECT id FROM `login` where `username`=?);", [req.body.username], (role_err, role_result) => {
    if (role_err) throw role_err;
    if (role_result.length > 0) {
      con.query("SELECT am.id,m.module_name,m.url,am.status,am.date FROM assign_module as am inner Join module as m on am.module = m.id where role = ? ORDER BY am.module ASC;", [role_result[0].role_id], (ro_err, ro_result) => {
        if (ro_err) throw ro_err;
        if (ro_result) {
          res.status(200).json(btoa(JSON.stringify({
            error: false,
            status: true,
            data: ro_result
          })))
        }
      })
    } else {
      res.status(401).json({
        error: true,
        status: false,
        massage: "This user is not assigned role"
      })
    }
  })
});

app.post("/add-role", verifytoken, (req, res) => {
  con.query(
    "select * from role where display_name=?",
    [req.body.display_name],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.send("Display name is already exist");
      } else {
        con.query(
          "INSERT INTO `role`(`name`, `display_name`, `view`, `delete_d`, `update_d`, `play_btn`) VALUES (?,?,?,?,?,?)",
          [req.body.name, req.body.display_name, (req.body.view_d).toString(), (req.body.delete_d).toString(), (req.body.update_d).toString(), (req.body.play_d).toString()],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).json({
                error: false,
                status: true,
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-role", verifytoken, (req, res) => {
  con.query("select * from role", (err, result) => {
    if (err) throw err;
    res.status(200).json({ data: result });
  });
});
app.post("/status-role", verifytoken, (req, res) => {
  con.query(
    "UPDATE `role` SET `status`= ? WHERE `id`=?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send({ error: false, status: true })
      }
    }
  );
})
app.post("/update-role", verifytoken, (req, res) => {
  con.query("UPDATE `role` SET `name`=?,`display_name`=?,`view`=?,`delete_d`=?,`update_d`=?,`play_btn`=? WHERE `id`=?", [req.body.name, req.body.dname, (req.body.view_d).toString(), (req.body.delete_d).toString(), (req.body.update_d).toString(), (req.body.play_d).toString(), req.body.id], (err, result) => {
    if (err) throw err;
    res.status(200).json({ error: false, status: true });
  });
});
app.post("/get-role-not-assign", verifytoken, (req, res) => {
  con.query("select * from role where role_assign = 'N'", (err, result) => {
    if (err) throw err;
    res.status(200).json({ data: result });
  });
});
app.post("/get-role-assign", verifytoken, (req, res) => {
  con.query("select * from role where role_assign = 'Y'", (err, result) => {
    if (err) throw err;
    res.status(200).json({ data: result });
  });
});

app.post("/add-module", verifytoken, (req, res) => {
  con.query(
    "select * from module where module_name=?",
    [req.body.module_name],
    (err, result) => {
      if (err) throw err;
      if (result[0] == null) {
        con.query(
          "INSERT INTO `module`(`url`, `module_name`) VALUES (?,?)",
          [req.body.url, req.body.module_name],
          (err, result) => {
            if (err) throw err;
            else {
              res.status(200).send(true);
            }
          }
        );
      } else {
        res.send("Module name is already exist");
      }
    }
  );
});
app.post("/get-module", verifytoken, (req, res) => {
  con.query("select * from `module`", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});
app.post("/status-module", verifytoken, (req, res) => {
  con.query(
    "UPDATE `module` SET `status`= ? WHERE `id`=?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/get-module-id", verifytoken, (req, res) => {
  con.query(
    "select * from `module` where id=?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(result);
      }
    }
  );
});
app.post("/update-module", (req, res) => {
  con.query(
    "UPDATE `module` SET `module_name`=?,`url`=? WHERE `id`=?",
    [req.body.module_name, req.body.url, req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(403).send("module name is already exist");
        }
      } else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/del-module", verifytoken, (req, res) => {
  con.query("DELETE FROM `assign_module` WHERE `module`=?", [req.body.id], (error, resultt) => {
    if (error) {
      throw error;
    }
    if (resultt) {
      con.query("DELETE FROM `module` where id=?", [req.body.id], (err, result) => {
        if (err) throw err;
        else {
          res.status(200).send(true);
        }
      });
    }
  })
});
app.post("/assign-module", verifytoken, (req, res) => {
  for (var module of req.body.module) {
    con.query("INSERT INTO `assign_module`(`role`, `module`) VALUES (?,?)", [req.body.role_id, module])
  }
  con.query("UPDATE `role` SET `role_assign`='Y' WHERE `id`=?", [req.body.role_id], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).json({
        error: false,
        status: true,
        message: "Module Assign Successfully"
      })
    }
  })
});
app.post("/get-assign-module", verifytoken, (req, res) => {
  con.query('SELECT am.id,m.module_name,r.display_name FROM `assign_module` am INNER join module m on am.module = m.id INNER JOIN role r on am.role = r.id WHERE am.role = ?', [req.body.id], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).json({
        error: false,
        status: true,
        data: result
      })
    }
  })
});
app.post("/update-assign-module", verifytoken, (req, res) => {
  con.query("DELETE FROM `assign_module` WHERE `role` = ?", [req.body.role_id], (error, resultt) => {
    if (error) {
      throw error;
    }
    if (resultt) {
      for (var module of req.body.module) {
        con.query("INSERT INTO `assign_module`(`role`, `module`) VALUES (?,?)", [req.body.role_id, module])
      }
      res.status(200).json({
        error: false,
        status: true,
        message: "Module Assign Upadated Successfully"
      })
    }
  })

});
app.post("/get-assign-module-id", verifytoken, (req, res) => {
  con.query('SELECT am.module FROM `assign_module` am INNER join module m on am.module = m.id INNER JOIN role r on am.role = r.id WHERE am.role = ?', [req.body.id], (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).json({
        error: false,
        status: true,
        data: result
      })
    }
  })
});

app.post("/get-pay-method", verifytoken, (req, res) => {
  con.query("select * from colorgame.payment_method", (err, result) => {
    if (err) throw err;
    if (result) {
      res.status(200).send({
        error: false,
        status: true,
        data: result,
      });
    }
  });
});
app.post("/add-payment-details-upi", upload.single("qr_code"), verifytoken, (req, res) => {
    var body = req.body;
    con.query(
      "select * from payment_details where UPI_id = ?",
      [body.upi_id],
      (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          res.status(302).json({
            error: true,
            status: false,
            massage: "UPI Id is Already exist",
          });
        } else {
          if (req.body.payment_method === "Google Pay") {
            con.query(
              "INSERT INTO `payment_details`(`paymethod_id`, `name`, `UPI_id`, `QR_code`, `icons`) VALUES (?,?,?,?,?)",
              [
                body.payment_method,
                body.name,
                body.upi_id,
                req.file.filename,
                "googlepay.png",
              ],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  res.status(200).json({
                    error: false,
                    status: true,
                    massage: "Insert Google Pay Details SuccessFully",
                  });
                }
              }
            );
          } else if (req.body.payment_method === "Phone Pe") {
            con.query(
              "INSERT INTO `payment_details`(`paymethod_id`, `name`, `UPI_id`, `QR_code`, `icons`) VALUES (?,?,?,?,?)",
              [
                body.payment_method,
                body.name,
                body.upi_id,
                req.file.filename,
                "phonepe.png",
              ],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  res.status(200).json({
                    error: false,
                    status: true,
                    massage: "Insert Phone pe Details SuccessFully",
                  });
                }
              }
            );
          } else {
            con.query(
              "INSERT INTO `payment_details`(`paymethod_id`, `name`, `UPI_id`, `QR_code`, `icons`) VALUES (?,?,?,?,?)",
              [
                body.payment_method,
                body.name,
                body.upi_id,
                req.file.filename,
                "paytm.png",
              ],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  res.status(200).json({
                    error: false,
                    status: true,
                    massage: "Insert Paytm Details SuccessFully",
                  });
                }
              }
            );
          }
        }
      }
    );
  }
);
app.post("/add-payment-details-bank", verifytoken, (req, res) => {
  var body = req.body;
  con.query(
    "select * from payment_details where account_no = ?",
    [body.account_no],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(302).json({
          error: true,
          status: false,
          massage: "Account Number is Already exist",
        });
      } else {
        con.query(
          "INSERT INTO `payment_details`(`paymethod_id`, `name`, `bank_name`, `account_no`, `ifsc_code`, `account_type`) VALUES (?,?,?,?,?,?)",
          [
            parseInt(body.payment_method),
            body.name,
            body.bank_name,
            body.account_no,
            body.ifsc_code,
            body.account_type,
          ],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).json({
                error: false,
                status: true,
                massage: "Insert Bank Details SuccessFully",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/get-payment-details", verifytoken, (req, res) => {
  con.query(
    "select pd.id,pm.id as pm_id,pm.name as payment_method,pd.name,pd.UPI_id,pd.QR_code,pd.bank_name,pd.account_no,pd.ifsc_code,pd.account_type,pm.icon,pd.status from colorgame.payment_details as pd inner Join colorgame.payment_method as pm on pd.paymethod_id = pm.id where pm.name = ?;",
    [req.body.method],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send({ data: result });
      }
    }
  );
});
app.post("/status-payment-details", verifytoken, (req, res) => {
  con.query(
    "select id from payment_details  where status = 'Y' and paymethod_id = ?",
    [req.body.method],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        con.query(
          "UPDATE `payment_details` SET `status`=? WHERE `id`= ?",
          ["N", result[0].id],
          (err, result) => {
            if (err) throw err;
            if (result) {
              con.query(
                "UPDATE `payment_details` SET `status`=? WHERE `id`= ?",
                ["Y", req.body.id],
                (err, result) => {
                  if (err) throw err;
                  if (result) {
                    res.status(200).json({
                      error: false,
                      status: true,
                      massage: " Status Changed SuccessFully",
                    });
                  }
                }
              );
            }
          }
        );
      } else {
        con.query(
          "UPDATE `payment_details` SET `status`=? WHERE `id`= ?",
          ["Y", req.body.id],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).json({
                error: false,
                status: true,
                massage: " Status Changed SuccessFully",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/del-payment-details", verifytoken, (req, res) => {
  con.query(
    "DELETE FROM `payment_details` where id=?",
    [req.body.id],
    (err, result) => {
      if (err) {
        if (true == (err.sqlMessage == "Cannot delete or update a parent row: a foreign key constraint fails (`colorgame`.`deposit`, CONSTRAINT `paymethod_id` FOREIGN KEY (`paymethod_id`) REFERENCES `payment_details` (`id`))")) {
          res.status(405).json({
            error: true,
            status: false,
            massage: "This payment method is already Used",
          });
        } else {
          throw err;
        }
      }
      else {
        res.status(200).json({
          error: false,
          status: true,
          massage: "Your file has been deleted.",
        });
      }
    }
  );
});
app.post("/update-payment-details", upload.single("qr_code"), verifytoken, (req, res) => {
  con.query(
    "UPDATE `payment_details` SET `name`=?,`UPI_id`=?,`QR_code`=? WHERE `id`=?",
    [req.body.name, req.body.upi_id, req.file.filename, req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(403).send("UPI Id is already exist");
        }
      }
      if (result) {
        res.status(200).send({
          error: false,
          status: true,
          massage: "Update Details SuccessFully",
        });
      }
    }
  );
});
app.post("/update-bank-payment-details", verifytoken, (req, res) => {
  var body = req.body;
  con.query("select id from `payment_details` where  `account_no` = ?", [body.account_no], (errror, ressult) => {
    if (errror) throw errror;
    if (ressult.length > 0) {
      if (ressult[0].id == body.id) {
        con.query(
          "UPDATE `payment_details` SET `name`=?,`bank_name`=?,`account_no`=?,`ifsc_code`=?,`account_type`=? WHERE `id`=?",
          [
            body.name,
            body.bank_name,
            body.account_no,
            body.ifsc_code,
            body.account_type,
            body.id,
          ],
          (err, result) => {
            if (err) {
              throw err;
            }
            if (result) {
              res.status(200).send({ error: false, status: true, massage: "Details Updated SuccessFully" });
            }
          }
        );
      } else {
        res.status(302).send({ error: true, status: false, massage: "Account No is already exist" });
      }
    } else {
      con.query(
        "UPDATE `payment_details` SET `name`=?,`bank_name`=?,`account_no`=?,`ifsc_code`=?,`account_type`=? WHERE `id`=?",
        [
          body.name,
          body.bank_name,
          body.account_no,
          body.ifsc_code,
          body.account_type,
          body.id,
        ],
        (err, result) => {
          if (err) {
            throw err;
          }
          if (result) {
            res.status(200).send({ error: false, status: true, massage: "Details Updated SuccessFully" });
          }
        }
      );
    }
  })

});

app.post("/get-user-details", verifytoken, (req, res) => {
  con.query(
    "select ud.id as id,ud.user_name,ud.uid,w.id as wid,w.wallet_balance,ud.status,ud.date from colorgame.user_details as ud inner join colorgame.wallet as w on ud.user_name=w.user_name;",
    [req.body.method],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send({
          error: false,
          status: true,
          data: result,
        });
      }
    }
  );
});
app.post("/status-user-details", verifytoken, (req, res) => {
  con.query(
    "UPDATE `user_details` SET `status`=? WHERE `id`= ?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).json({
          error: false,
          status: true,
          massage: "Status Changed SuccessFully",
        });
      }
    }
  );
});
app.post("/del-user-details", verifytoken, (req, res) => {
  con.query(
    "DELETE FROM `user_details` where id=?",
    [req.body.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        con.query(
          "DELETE FROM `wallet` where id=?",
          [req.body.wid],
          (err, result) => {
            if (err) throw err;
            else {
              res.status(200).json({
                error: false,
                status: true,
                massage: "Your Details has been deleted.",
              });
            }
          }
        );
      }
    }
  );
});
app.post("/update-user-details", verifytoken, (req, res) => {
  con.query(
    "UPDATE `payment_details` SET `name`=?,`UPI_id`=?,`QR_code`=? WHERE `id`=?",
    [req.body.name, req.body.upi_id, req.file.filename, req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(403).send("UPI Id is already exist");
        }
      }
      if (result) {
        res.status(200).send({
          error: false,
          status: true,
          massage: "Update Details SuccessFully",
        });
      }
    }
  );
});

app.post("/get-deposit-request", verifytoken, (req, res) => {
  if (req.body.status === "Pending") {
    con.query(
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cd.Approved_declined_By,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id WHERE cd.`status` = 'Pending';",
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
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cd.Approved_declined_By,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id WHERE cd.`status` = 'Success';",
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
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cd.Approved_declined_By,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id WHERE cd.`status` = 'Canceled';",
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
      "SELECT cd.id,cd.user_name,cd.image,cd.transaction_id,cd.reason,cd.payment,cd.balance,cd.status,cd.Approved_declined_By,cp.name as holder_name,cp.account_no,cp.account_type,cp.bank_name,cp.ifsc_code,cp.UPI_id,cd.date FROM colorgame.`deposit` as cd inner join colorgame.payment_details as cp on cd.paymethod_id = cp.id;",
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
app.post("/approve-deposit-request", verifytoken, (req, res) => {
  con.query(
    "UPDATE `deposit` SET `status`='Success',`Approved_declined_By`=? WHERE `id` = ?",
    [req.body.username, req.body.id],
    (error, result) => {
      if (error) throw error;
      if (result) {
        con.query(
          "UPDATE `wallet` SET `wallet_balance`=wallet_balance+(SELECT `balance` from `deposit` where `id` = ?) WHERE `user_name`=?;",
          [req.body.id, req.body.mobile],
          (err, resultt) => {
            if (err) throw err;
            if (resultt) {
              con.query("INSERT INTO `statement`(`username`,`bet_or_type`, `bet_from`, `bet_balance`, `total_balance`) VALUES (?,'Deposit Balance','Deposit Wallet',(SELECT `balance` from `deposit` where `id` = ?),(SELECT `wallet_balance` FROM `wallet` WHERE `user_name` = ?))",
                [req.body.mobile, req.body.id, req.body.mobile], (errr, resu) => {
                  if (errr) {
                    throw errr;
                  }
                  if (resu) {
                    res.status(200).send({
                      error: false,
                      status: true,
                      massage: "Wallet Update SuccessFully",
                    });
                  }
                })
            }
          }
        );
      }
    }
  );
});
app.post("/decline-deposit-request", verifytoken, (req, res) => {
  con.query(
    "UPDATE `deposit` SET `status`=?,`reason`=?,`Approved_declined_By`=? WHERE `id` = ?",
    ["Canceled", req.body.reason, req.body.username, req.body.id],
    (err, resultt) => {
      if (err) throw err;
      if (resultt) {
        res.status(200).send({
          error: false,
          status: true,
          massage: "Update Deatils SuccessFully",
        });
      }
    }
  );
});

app.post("/get-bank-details", verifytoken, (req, res) => {
  if (req.body.status === "Pending") {
    con.query(
      "SELECT * FROM `userbankdeatils` where `status`=?",
      [req.body.status],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else if (req.body.status === "Success") {
    con.query(
      "SELECT * FROM `userbankdeatils` where `status`=?",
      [req.body.status],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else if (req.body.status === "Canceled") {
    con.query(
      "SELECT * FROM `userbankdeatils` where `status`=?",
      [req.body.status],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else {
    con.query("SELECT * FROM `userbankdeatils`", (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send({ error: false, status: true, data: result });
      }
    });
  }
});
app.post("/approve-bank-details", verifytoken, (req, res) => {
  con.query(
    "UPDATE `userbankdeatils` SET `status`='Success',`approved_or_denied_by`=? WHERE `id` = ?",
    [req.body.username, req.body.id],
    (error, result) => {
      if (error) throw error;
      if (result) {
        res.status(200).send({
          error: false,
          status: true,
          massage: "Approved Bank SuccessFully",
        });
      }
    }
  );
});
app.post("/decline-bank-details", verifytoken, (req, res) => {
  con.query(
    "UPDATE `userbankdeatils` SET `status`=?,`reason`=?,`approved_or_denied_by`=? WHERE `id` = ?",
    ["Canceled", req.body.reason, req.body.username, req.body.id],
    (err, resultt) => {
      if (err) throw err;
      if (resultt) {
        res.status(200).send({
          error: false,
          status: true,
          massage: "Decline Bank Details!",
        });
      }
    }
  );
});

app.post("/get-withdrawal-request", verifytoken, (req, res) => {
  if (req.body.status === "Pending") {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,w.Approved_declined_By,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date  FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.status='Pending'",
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else if (req.body.status === "Success") {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,w.Approved_declined_By,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date  FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.status='Success'",
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else if (req.body.status === "Canceled") {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,w.Approved_declined_By,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date  FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END where w.status='Canceled'",
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  } else {
    con.query(
      "SELECT w.id,w.user_name,w.balance,w.reason,w.Approved_declined_By,b.account_no,b.account_holder_name,b.account_type,b.bankname,b.ifsc_code,upi.name as upiname,upi.UPI_id,num.name,num.number,w.paytype,W.status,w.date FROM colorgame.withdrawal as w left JOIN colorgame.userbankdeatils as b ON CASE WHEN w.paytype = 'Bank Transfer' THEN w.paymethod_id = b.id ELSE NULL END left JOIN colorgame.userupidetails as upi ON CASE WHEN w.paytype = 'UPI Id' THEN w.paymethod_id = upi.id ELSE NULL END left JOIN colorgame.usernumberdetails as num ON CASE WHEN w.paytype = 'Number' THEN w.paymethod_id = num.id ELSE NULL END",
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send({ error: false, status: true, data: result });
        }
      }
    );
  }
});
app.post("/approve-withdrawal-request", verifytoken, (req, res) => {
  con.query(
    "UPDATE `withdrawal` SET `Approved_declined_By`=?,`status`='Success' WHERE `id`=? AND `user_name`=?",
    [req.body.username, req.body.id, req.body.mobile],
    (error, result) => {
      if (error) throw error;
      if (result) {
        con.query("INSERT INTO `statement`(`username`,`bet_or_type`, `bet_from`, `bet_balance`, `total_balance`) VALUES ('Withdrawal','Winning Wallet',(SELECT `balance` FROM `withdrawal` WHERE `id`=?),(SELECT `wallet_balance` FROM `wallet` WHERE `user_name` = ?))", [req.body.mobile, req.body.id, req.body.mobile], (errr, resu) => {
          if (errr) {
            throw errr;
          }
          if (resu) {
            res.status(200).send({
              error: false,
              status: true,
              massage: "Approved User Details SuccessFully",
            });
          }
        })
      }
    }
  );
});
app.post("/decline-withdrawal-request", verifytoken, (req, res) => {
  con.query(
    "UPDATE `withdrawal` SET `reason`=?,`Approved_declined_By`=?,`status`='Canceled' WHERE `id`=?",
    [req.body.reason, req.body.username, req.body.id],
    (err, resultt) => {
      if (err) throw err;
      if (resultt) {
        con.query(
          "UPDATE `wallet` SET `wallet_balance`=wallet_balance+(SELECT `balance` FROM `withdrawal` WHERE `id`=?) WHERE `user_name`=(SELECT `user_name` FROM `withdrawal` WHERE `id`=?);",
          [req.body.id, req.body.id],
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

app.post("/add-team", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `teams` WHERE `team_name` = ?",
    [req.body.team_name],
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        con.query(
          "SELECT * FROM `teams` WHERE `short_name` = ?",
          [req.body.short_name],
          (errt, resultt) => {
            if (errt) throw errt;
            if (resultt.length == 0) {
              con.query(
                "INSERT INTO `teams`(`team_name`, `short_name`) VALUES (?,?)",
                [req.body.team_name, req.body.short_name],
                (err, result) => {
                  if (err) throw err;
                  else {
                    res.status(200).send(true);
                  }
                }
              );
            } else {
              res.status(302).send("Shortname is already exist");
            }
          }
        );
      } else {
        res.status(302).send("Teamname is already exist");
      }
    }
  );
});
app.post("/get-team", verifytoken, (req, res) => {
  con.query("select * from `teams`", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});
app.post("/status-team", verifytoken, (req, res) => {
  con.query(
    "UPDATE `teams` SET `status`= ? WHERE `id`=?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/update-team", verifytoken, (req, res) => {
  con.query(
    "UPDATE `teams` SET `team_name`=?,`short_name`=? WHERE `id`=?",
    [req.body.team_name, req.body.short_name, req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          const bearer = ((err.sqlMessage.split(" ")).pop().split(".")).pop().split("'");
          if (bearer[0] == "short_name") {
            res.status(403).send("Shortname is already exist");
          }
          if (bearer[0] == "team_name") {
            res.status(403).send("Teamname is already exist");
          }
        }
      } else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/del-team", verifytoken, (req, res) => {
  con.query("DELETE FROM `teams` where id=?", [req.body.id], (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(true);
    }
  });
});

app.post("/add-series", verifytoken, (req, res) => {
  con.query(
    "SELECT * FROM `series` WHERE `series_name` = ?",
    [req.body.series_name],
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        con.query(
          "INSERT INTO `series`(`series_name`, `series_type`) VALUES (?,?)",
          [req.body.series_name, req.body.series_type],
          (err, result) => {
            if (err) throw err;
            if (result) {
              res.status(200).send(true);
            }
          }
        );
      } else {
        res.status(302).send("Teamname is already exist");
      }
    }
  );
});
app.post("/get-series", verifytoken, (req, res) => {
  con.query("select * from `series`", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});
app.post("/status-series", verifytoken, (req, res) => {
  con.query(
    "UPDATE `series` SET `status`= ? WHERE `id`=?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/update-series", verifytoken, (req, res) => {
  con.query(
    "UPDATE `series` SET `series_name`=?,`series_type`=? WHERE `id`=?",
    [req.body.series_name, req.body.series_type, req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          const bearer = ((err.sqlMessage.split(" ")).pop().split(".")).pop().split("'");
          if (bearer[0] == "series_name") {
            res.status(403).send("Series name is already exist");
          }
        }
      } if(result) {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/del-series", verifytoken, (req, res) => {
  con.query("DELETE FROM `series` where id=?", [req.body.id], (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(true);
    }
  });
});

app.post("/add-match", verifytoken, (req, res) => {
  con.query(
    "INSERT INTO `match`( `team1_id`, `team2_id`, `series_id`, `match_date`) VALUES (?,?,?,?)",
    [req.body.team_one, req.body.team_two, req.body.series_id, req.body.match_date],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send(true);
      }
    }
  );
  // con.query(
  //   "SELECT * FROM `series` WHERE `series_name` = ?",
  //   [req.body.series_name],
  //   (err, result) => {
  //     if (err) throw err;
  //     if (result.length == 0) {
  //       con.query(
  //         "INSERT INTO `match`( `team1_id`, `team2_id`, `series_id`, `match_date`) VALUES (?,?,?,?)",
  //         [req.body.series_name, req.body.series_type],
  //         (err, result) => {
  //           if (err) throw err;
  //           if (result) {
  //             res.status(200).send(true);
  //           }
  //         }
  //       );
  //     } else {
  //       res.status(302).send("Teamname is already exist");
  //     }
  //   }
  // );
});
app.post("/get-match", verifytoken, (req, res) => {
  con.query("SELECT m.id,t1.team_name as team1_name,t2.team_name as team2_name,s.series_name,m.team1_id,m.team2_id,m.series_id,m.result,m.status,m.match_date FROM `match` as m INNER join teams as t1 on m.team1_id = t1.id INNER join teams as t2 on m.team2_id = t2.id INNER join series as s on s.id = m.series_id", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});
app.post("/status-match", verifytoken, (req, res) => {
  con.query(
    "UPDATE `match` SET `status`= ? WHERE `id`=?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/update-match", verifytoken, (req, res) => {
  con.query(
    "UPDATE `match` SET `team1_id`=?,`team2_id`=?,`series_id`=?,`match_date`=? WHERE `id` = ?",
    [req.body.team_one, req.body.team_two, req.body.series_id, req.body.match_date,req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          const bearer = ((err.sqlMessage.split(" ")).pop().split(".")).pop().split("'");
          if (bearer[0] == "series_name") {
            res.status(403).send("Series name is already exist");
          }
        }
      } if(result) {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/del-match", verifytoken, (req, res) => {
  con.query("DELETE FROM `match` where id=?", [req.body.id], (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(true);
    }
  });
});
app.post("/get-match-by-id", verifytoken, (req, res) => {
  con.query("SELECT m.id,t1.team_name as team1_name,t1.short_name as t1_sname,t2.team_name as team2_name,t2.short_name as t2_sname,s.series_name,m.team1_id,m.team2_id,m.series_id,m.result,m.status,m.match_date FROM `match` as m INNER join teams as t1 on m.team1_id = t1.id INNER join teams as t2 on m.team2_id = t2.id INNER join series as s on s.id = m.series_id where `series_id` = ?",[req.body.id], (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});

app.post("/add-prediction", verifytoken, (req, res) => {
  con.query(
    "INSERT INTO `match_prediction`(`match_id`, `pre_question`, `pre_answer`) VALUES (?,?,?)",
          [req.body.match_id, req.body.pre_question, req.body.pre_answer],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send(true);
      }
    }
  );
 });
app.post("/get-prediction", verifytoken, (req, res) => {
  con.query("SELECT (SELECT `team_name` FROM `teams` WHERE `id` = m.team1_id) as team1_name,(SELECT `short_name` FROM `teams` WHERE `id` = m.team1_id) as team1_sname,(SELECT `team_name` FROM `teams` WHERE `id` = m.team2_id) as team2_name,(SELECT `short_name` FROM `teams` WHERE `id` = m.team2_id) as team2_sname,(SELECT `series_type` FROM `series` WHERE `id` = m.series_id) as series_type,(SELECT `series_name` FROM `series` WHERE `id` = m.series_id) as series_name,mp.pre_question,mp.pre_answer,mp.status,m.match_date FROM `match_prediction` as mp INNER join `match` as m on mp.match_id = m.id", (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send({ data: result });
    }
  });
});
app.post("/status-prediction", verifytoken, (req, res) => {
  con.query(
    "UPDATE `match_prediction` SET `status`= ? WHERE `id`=?",
    [req.body.status, req.body.id],
    (err, result) => {
      if (err) throw err;
      else {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/update-prediction", verifytoken, (req, res) => {
  con.query(
    "UPDATE `match` SET `team1_id`=?,`team2_id`=?,`series_id`=?,`match_date`=? WHERE `id` = ?",
    [req.body.team_one, req.body.team_two, req.body.series_id, req.body.match_date, req.body.id],
    (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          const bearer = ((err.sqlMessage.split(" ")).pop().split(".")).pop().split("'");
          if (bearer[0] == "series_name") {
            res.status(403).send("Series name is already exist");
          }
        }
      } if (result) {
        res.status(200).send(true);
      }
    }
  );
});
app.post("/del-prediction", verifytoken, (req, res) => {
  con.query("DELETE FROM `match_prediction` where id=?", [req.body.id], (err, result) => {
    if (err) throw err;
    else {
      res.status(200).send(true);
    }
  });
});

function verifytoken(req, res, next) {
  var dec = atob(req.body.data);
  req.body = JSON.parse(dec);
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRET_KEY_ADMIN, (err, auth) => {
      if (err) {
        jwt.verify(
          req.token,
          process.env.SECRET_KEY_SUPERADMIN,
          (err, auth) => {
            if (err) {
              res.status(403).send('Token Expire');
            } else {
              if (auth.username != req.body.username) {
                res.status(403).send("false");
              } else {
                next();
              }
            }
          }
          );
        } else {
          if (auth.username != req.body.username) {
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
