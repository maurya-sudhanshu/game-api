-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 14, 2023 at 11:53 AM
-- Server version: 8.0.31
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `game_prediction`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `Register` (IN `mobile` VARCHAR(50), IN `uname` VARCHAR(50), IN `refferby` VARCHAR(50))   BEGIN
declare a2 varchar(50) default 0;
   label: LOOP
   set a2 = FLOOR(RAND() * 100000000);
   if (0 = (SELECT count(*) FROM `user_details` WHERE `referral_id` = a2)) THEN
    INSERT INTO `user_details`(`name`,`user_name`,`referral_id`,`reffer_by`) VALUES (uname,mobile,a2,refferby);
    INSERT INTO `wallet`(`user_name`, `wallet_balance`) VALUES (mobile,0);
    select 1 as status,a2 as referral_id;
   LEAVE label;
		end if;
   END LOOP label;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `assign_module`
--

CREATE TABLE `assign_module` (
  `id` int NOT NULL,
  `role` int NOT NULL,
  `module` int NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assign_module`
--

INSERT INTO `assign_module` (`id`, `role`, `module`, `status`, `date`) VALUES
(165, 5, 1, 'Y', '2023-02-21 09:19:53'),
(169, 5, 13, 'Y', '2023-02-21 09:19:53'),
(170, 5, 18, 'Y', '2023-02-21 09:19:53'),
(171, 5, 20, 'Y', '2023-02-21 09:19:53'),
(175, 5, 28, 'Y', '2023-02-21 09:19:53'),
(177, 5, 30, 'Y', '2023-02-21 09:19:53'),
(336, 3, 40, 'Y', '2023-04-12 12:20:42'),
(337, 3, 1, 'Y', '2023-04-12 12:20:42'),
(338, 3, 13, 'Y', '2023-04-12 12:20:42'),
(339, 3, 41, 'Y', '2023-04-12 12:20:42'),
(340, 3, 18, 'Y', '2023-04-12 12:20:42'),
(341, 3, 20, 'Y', '2023-04-12 12:20:42'),
(342, 3, 28, 'Y', '2023-04-12 12:20:42'),
(343, 3, 32, 'Y', '2023-04-12 12:20:42'),
(344, 3, 30, 'Y', '2023-04-12 12:20:42'),
(345, 3, 39, 'Y', '2023-04-12 12:20:42');

-- --------------------------------------------------------

--
-- Table structure for table `bank_details`
--

CREATE TABLE `bank_details` (
  `id` int NOT NULL,
  `user_name` varchar(200) NOT NULL,
  `account_number` varchar(200) NOT NULL,
  `IFSC_code` varchar(200) NOT NULL,
  `bank_name` varchar(200) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `action` varchar(200) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deposit`
--

CREATE TABLE `deposit` (
  `id` int NOT NULL,
  `user_name` varchar(200) NOT NULL,
  `balance` varchar(200) NOT NULL,
  `image` varchar(200) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `payment` varchar(50) NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pending',
  `reason` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '.',
  `Approved_declined_By` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Not Approved',
  `paymethod_id` int NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `id` int NOT NULL,
  `name` varchar(10) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `device_logged_in` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'N',
  `status` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`id`, `name`, `username`, `password`, `device_logged_in`, `status`, `date`) VALUES
(14, 'Kumarxx', 'Superadmin', '$2b$12$Npa7vieLwpl5u.XFgi.Fo.CCoU5w6rPJVyc462yIS24NDx13bFDYS', 'Y', 'Y', '2022-07-29 00:02:44'),
(29, 'aaaa', 'aaa', '$2b$10$oD15Wig4bnE0MRdgLogGle1AhT.F8Y9XA58BwbHwu2GD3MgnZwG4K', 'N', 'Y', '2023-04-13 05:48:03');

-- --------------------------------------------------------

--
-- Table structure for table `match`
--

CREATE TABLE `match` (
  `id` int NOT NULL,
  `team1_id` int NOT NULL,
  `team2_id` int NOT NULL,
  `series_id` int NOT NULL,
  `match_date` datetime NOT NULL,
  `result` varchar(1) NOT NULL DEFAULT 'U',
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `match`
--

INSERT INTO `match` (`id`, `team1_id`, `team2_id`, `series_id`, `match_date`, `result`, `status`, `date`) VALUES
(1, 2, 3, 2, '2023-04-12 15:30:00', 'U', 'Y', '2023-04-03 09:43:57'),
(2, 2, 3, 2, '2023-04-14 12:31:00', 'U', 'Y', '2023-04-13 07:01:13'),
(3, 1, 3, 2, '2023-04-22 12:36:00', 'U', 'Y', '2023-04-13 07:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `match_prediction`
--

CREATE TABLE `match_prediction` (
  `id` int NOT NULL,
  `match_id` int NOT NULL,
  `pre_question` varchar(100) NOT NULL,
  `pre_answer` varchar(100) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `match_prediction`
--

INSERT INTO `match_prediction` (`id`, `match_id`, `pre_question`, `pre_answer`, `status`, `date`) VALUES
(1, 1, '10 Over', '55 Runs', 'Y', '2023-04-05 06:57:39');

-- --------------------------------------------------------

--
-- Table structure for table `module`
--

CREATE TABLE `module` (
  `id` int NOT NULL,
  `module_name` varchar(200) NOT NULL,
  `url` varchar(200) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `module`
--

INSERT INTO `module` (`id`, `module_name`, `url`, `status`, `date`) VALUES
(1, 'Dashboard', '/home/dashboard', 'Y', '2022-07-26 05:55:10'),
(13, 'module', '/home/module', 'Y', '2022-07-26 05:55:10'),
(18, 'role', '/home/role', 'Y', '2022-08-03 00:44:23'),
(20, 'activity mapping', '/home/activity-mapping', 'Y', '2022-08-05 00:35:20'),
(28, 'User Details', '/home/user-details', 'Y', '2022-10-19 05:26:14'),
(30, 'Sub-Admin', '/home/sub-admin', 'Y', '2023-02-16 09:55:26'),
(32, 'Matches', 'matches', 'Y', '2023-03-29 09:03:34'),
(39, 'Series', '/home/series', 'Y', '2023-04-06 05:27:23'),
(40, 'Prediction', '/home/prediction', 'Y', '2023-04-06 05:28:06'),
(41, 'Team', '/home/team', 'Y', '2023-04-12 11:26:03');

-- --------------------------------------------------------

--
-- Table structure for table `payment_details`
--

CREATE TABLE `payment_details` (
  `id` int NOT NULL,
  `paymethod_id` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `UPI_id` varchar(45) DEFAULT NULL,
  `QR_code` varchar(45) DEFAULT NULL,
  `icons` varchar(50) DEFAULT NULL,
  `bank_name` varchar(45) DEFAULT NULL,
  `account_no` varchar(45) DEFAULT NULL,
  `ifsc_code` varchar(45) DEFAULT NULL,
  `account_type` varchar(45) DEFAULT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'N',
  `Date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_details`
--

INSERT INTO `payment_details` (`id`, `paymethod_id`, `name`, `UPI_id`, `QR_code`, `icons`, `bank_name`, `account_no`, `ifsc_code`, `account_type`, `status`, `Date`) VALUES
(27, 3, 'pay', 'paus@mnsd', 'qr_code-1680512428915-753544602.png', 'paytm.png', NULL, NULL, NULL, NULL, 'N', '2023-04-03 09:00:28');

-- --------------------------------------------------------

--
-- Table structure for table `payment_method`
--

CREATE TABLE `payment_method` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_method`
--

INSERT INTO `payment_method` (`id`, `name`, `icon`, `status`, `date`) VALUES
(1, 'Bank Transfer', 'imps.png', 'Y', '2022-10-15 07:21:45'),
(2, 'Phone Pe', 'phonepe.png', 'Y', '2022-10-15 07:21:45'),
(3, 'Paytm', 'paytm.png', 'Y', '2022-10-15 07:21:45'),
(5, 'Google Pay', 'googlepay.png', 'Y', '2022-10-15 07:21:45');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `view` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `delete_d` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `update_d` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `play_btn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role_assign` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'N',
  `status` varchar(1) NOT NULL DEFAULT 'N',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `display_name`, `view`, `delete_d`, `update_d`, `play_btn`, `role_assign`, `status`, `date`) VALUES
(3, 'Super Admin', 'Super Administration', 'true', 'true', 'true', 'true', 'Y', 'N', '2022-07-23 00:43:22'),
(5, 'Developer', 'For developer', 'true', 'true', 'true', 'true', 'Y', 'N', '2023-02-17 06:14:26'),
(6, 'View Admin', 'View Only', 'true', 'false', 'false', 'false', 'N', 'N', '2023-03-01 10:36:21');

-- --------------------------------------------------------

--
-- Table structure for table `role_assign`
--

CREATE TABLE `role_assign` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_assign`
--

INSERT INTO `role_assign` (`id`, `user_id`, `role_id`, `status`, `date`) VALUES
(4, 14, 3, 'Y', '2023-02-16 09:07:07'),
(19, 29, 3, 'Y', '2023-04-13 05:48:03');

-- --------------------------------------------------------

--
-- Table structure for table `series`
--

CREATE TABLE `series` (
  `id` int NOT NULL,
  `icons` varchar(100) NOT NULL,
  `series_name` varchar(200) NOT NULL,
  `series_type` varchar(200) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `series`
--

INSERT INTO `series` (`id`, `icons`, `series_name`, `series_type`, `status`, `date`) VALUES
(2, 'series-1681459619373-907527217.png', ' One Day Internationals', 'ODI', 'Y', '2023-04-03 08:29:46'),
(7, 'series-1681459619373-907527217.png', 'India', 'T-20', 'Y', '2023-04-14 08:06:59'),
(8, 'series-1681461963072-667211692.png', 'asd', 'T-20', 'Y', '2023-04-14 08:46:03');

-- --------------------------------------------------------

--
-- Table structure for table `statement`
--

CREATE TABLE `statement` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bet_or_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `period` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Select` varchar(50) DEFAULT NULL,
  `bet_from` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bet_balance` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_balance` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int NOT NULL,
  `icons` varchar(200) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `short_name` varchar(100) NOT NULL,
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `icons`, `team_name`, `short_name`, `status`, `date`) VALUES
(1, 'teams-1681464771792-474239836.png', 'India', 'IND', 'Y', '2023-03-31 11:22:09'),
(2, 'teams-1681464771792-474239836.png', 'Pakistan', 'PAK', 'Y', '2023-03-31 11:33:20'),
(3, 'teams-1681464771792-474239836.png', 'South Afrika', 'SA', 'Y', '2023-03-31 11:51:12'),
(4, 'teams-1681464771792-474239836.png', 'Indian Premium League', 'IPL', 'Y', '2023-04-14 09:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `userbankdeatils`
--

CREATE TABLE `userbankdeatils` (
  `id` int NOT NULL,
  `username` varchar(250) NOT NULL,
  `account_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ifsc_code` varchar(100) DEFAULT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `bankname` varchar(100) DEFAULT NULL,
  `account_type` varchar(100) DEFAULT NULL,
  `status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pending',
  `approved_or_denied_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Not Approved',
  `reason` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usernumberdetails`
--

CREATE TABLE `usernumberdetails` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `number` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userupidetails`
--

CREATE TABLE `userupidetails` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `UPI_id` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `user_name` varchar(200) NOT NULL,
  `device_logged_in` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `referral_id` varchar(100) NOT NULL,
  `reffer_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(1) DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`id`, `name`, `user_name`, `device_logged_in`, `date`, `referral_id`, `reffer_by`, `status`) VALUES
(18, '1sfsdfs', '9794368090', 'Y', '2023-04-13 06:46:36', '2652985', '', 'Y');

-- --------------------------------------------------------

--
-- Table structure for table `wallet`
--

CREATE TABLE `wallet` (
  `id` int NOT NULL,
  `user_name` varchar(200) NOT NULL,
  `wallet_balance` varchar(200) NOT NULL,
  `Winning_wallet` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `Bonus_wallet` varchar(50) NOT NULL DEFAULT '0',
  `status` varchar(1) NOT NULL DEFAULT 'Y',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallet`
--

INSERT INTO `wallet` (`id`, `user_name`, `wallet_balance`, `Winning_wallet`, `Bonus_wallet`, `status`, `date`) VALUES
(17, '9794368090', '0', '0', '0', 'Y', '2023-04-13 06:46:36');

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal`
--

CREATE TABLE `withdrawal` (
  `id` int NOT NULL,
  `user_name` varchar(200) NOT NULL,
  `balance` varchar(200) NOT NULL,
  `Approved_declined_By` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Not Approved',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pending',
  `paymethod_id` int NOT NULL,
  `paytype` varchar(50) NOT NULL,
  `reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assign_module`
--
ALTER TABLE `assign_module`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module` (`module`),
  ADD KEY `role_x` (`role`);

--
-- Indexes for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_number` (`account_number`);

--
-- Indexes for table `deposit`
--
ALTER TABLE `deposit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paymethod_id` (`paymethod_id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user` (`username`);

--
-- Indexes for table `match`
--
ALTER TABLE `match`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_one` (`team1_id`),
  ADD KEY `team_two` (`team2_id`),
  ADD KEY `series_id` (`series_id`);

--
-- Indexes for table `match_prediction`
--
ALTER TABLE `match_prediction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `match_match` (`match_id`);

--
-- Indexes for table `module`
--
ALTER TABLE `module`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `module_name` (`module_name`);

--
-- Indexes for table `payment_details`
--
ALTER TABLE `payment_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_no` (`account_no`),
  ADD UNIQUE KEY `UPI_id` (`UPI_id`),
  ADD KEY `payid` (`paymethod_id`);

--
-- Indexes for table `payment_method`
--
ALTER TABLE `payment_method`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `display_name` (`display_name`);

--
-- Indexes for table `role_assign`
--
ALTER TABLE `role_assign`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `role` (`role_id`);

--
-- Indexes for table `series`
--
ALTER TABLE `series`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `series_name` (`series_name`);

--
-- Indexes for table `statement`
--
ALTER TABLE `statement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `team_name` (`team_name`),
  ADD UNIQUE KEY `short_name` (`short_name`);

--
-- Indexes for table `userbankdeatils`
--
ALTER TABLE `userbankdeatils`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_no` (`account_no`);

--
-- Indexes for table `usernumberdetails`
--
ALTER TABLE `usernumberdetails`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `userupidetails`
--
ALTER TABLE `userupidetails`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UPI_id` (`UPI_id`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_name` (`user_name`);

--
-- Indexes for table `wallet`
--
ALTER TABLE `wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_name` (`user_name`);

--
-- Indexes for table `withdrawal`
--
ALTER TABLE `withdrawal`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assign_module`
--
ALTER TABLE `assign_module`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=358;

--
-- AUTO_INCREMENT for table `bank_details`
--
ALTER TABLE `bank_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deposit`
--
ALTER TABLE `deposit`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `match`
--
ALTER TABLE `match`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `match_prediction`
--
ALTER TABLE `match_prediction`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `module`
--
ALTER TABLE `module`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `payment_details`
--
ALTER TABLE `payment_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `payment_method`
--
ALTER TABLE `payment_method`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `role_assign`
--
ALTER TABLE `role_assign`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `series`
--
ALTER TABLE `series`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `statement`
--
ALTER TABLE `statement`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1136;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `userbankdeatils`
--
ALTER TABLE `userbankdeatils`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `usernumberdetails`
--
ALTER TABLE `usernumberdetails`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `userupidetails`
--
ALTER TABLE `userupidetails`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `wallet`
--
ALTER TABLE `wallet`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `withdrawal`
--
ALTER TABLE `withdrawal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assign_module`
--
ALTER TABLE `assign_module`
  ADD CONSTRAINT `module` FOREIGN KEY (`module`) REFERENCES `module` (`id`),
  ADD CONSTRAINT `role_x` FOREIGN KEY (`role`) REFERENCES `role` (`id`);

--
-- Constraints for table `deposit`
--
ALTER TABLE `deposit`
  ADD CONSTRAINT `paymethod_id` FOREIGN KEY (`paymethod_id`) REFERENCES `payment_details` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `match`
--
ALTER TABLE `match`
  ADD CONSTRAINT `series_id` FOREIGN KEY (`series_id`) REFERENCES `series` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `team_one` FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `team_two` FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `match_prediction`
--
ALTER TABLE `match_prediction`
  ADD CONSTRAINT `match_match` FOREIGN KEY (`match_id`) REFERENCES `match` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `payment_details`
--
ALTER TABLE `payment_details`
  ADD CONSTRAINT `payid` FOREIGN KEY (`paymethod_id`) REFERENCES `payment_method` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `role_assign`
--
ALTER TABLE `role_assign`
  ADD CONSTRAINT `role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `login` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
