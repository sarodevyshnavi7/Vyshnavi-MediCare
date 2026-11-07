CREATE DATABASE IF NOT EXISTS vyshnavi_pharmacy;
USE vyshnavi_pharmacy;

CREATE TABLE IF NOT EXISTS users (
 user_id INT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(100) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 phone VARCHAR(15),
 role VARCHAR(20) NOT NULL DEFAULT 'customer',
 CHECK (role IN ('admin','customer'))
);
CREATE TABLE IF NOT EXISTS medicines (
 medicine_id INT PRIMARY KEY AUTO_INCREMENT,
 medicine_name VARCHAR(100) NOT NULL,
 category VARCHAR(150) NOT NULL,
 manufacturer VARCHAR(100) NOT NULL,
 price DECIMAL(10,2) NOT NULL,
 stock INT NOT NULL DEFAULT 0,
 expiry_date DATE NOT NULL,
 CHECK (price >= 0), CHECK (stock >= 0)
);
CREATE TABLE IF NOT EXISTS orders (
 order_id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 order_date DATE NOT NULL,
 total_amount DECIMAL(10,2) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'Pending',
 CONSTRAINT fk_orders_user FOREIGN KEY(user_id) REFERENCES users(user_id),
 CHECK (total_amount >= 0)
);
CREATE TABLE IF NOT EXISTS order_items (
 item_id INT PRIMARY KEY AUTO_INCREMENT,
 order_id INT NOT NULL,
 medicine_id INT NOT NULL,
 quantity INT NOT NULL,
 price DECIMAL(10,2) NOT NULL,
 CONSTRAINT fk_items_order FOREIGN KEY(order_id) REFERENCES orders(order_id),
 CONSTRAINT fk_items_medicine FOREIGN KEY(medicine_id) REFERENCES medicines(medicine_id),
 CHECK (quantity > 0), CHECK (price >= 0)
);

-- Demo passwords for all accounts: MediCare@123
-- Replace these hashes with freshly generated bcrypt hashes before any real deployment.
INSERT IGNORE INTO users(user_id,name,email,password,phone,role) VALUES
(1,'Vyshnavi Admin','admin@vyshnavimedicare.demo','TEMP_HASH_RUN_SEED_SCRIPT','9000000001','admin'),
(2,'Ananya Rao','ananya@example.com','TEMP_HASH_RUN_SEED_SCRIPT','9000000002','customer'),
(3,'Rahul Kumar','rahul@example.com','TEMP_HASH_RUN_SEED_SCRIPT','9000000003','customer'),
(4,'Meera Reddy','meera@example.com','TEMP_HASH_RUN_SEED_SCRIPT','9000000004','customer');

INSERT IGNORE INTO medicines(medicine_id,medicine_name,category,manufacturer,price,stock,expiry_date) VALUES
(1,'Paracetamol 500 mg','Pain Relief','Demo Healthcare',25.00,45,'2027-12-31'),
(2,'Ibuprofen 200 mg','Pain Relief','Demo Healthcare',38.00,8,'2027-08-31'),
(3,'Cough Relief Syrup','Cold & Cough','Care Labs',95.00,18,'2027-06-30'),
(4,'Cetirizine 10 mg','Cold & Cough','Care Labs',22.00,60,'2027-10-31'),
(5,'Vitamin C Tablets','Vitamins & Supplements','NutriWell',110.00,32,'2028-01-31'),
(6,'Multivitamin Capsules','Vitamins & Supplements','NutriWell',185.00,7,'2027-11-30'),
(7,'Antiseptic Solution','First Aid','SafeCare',72.00,24,'2027-09-30'),
(8,'Adhesive Bandages','First Aid','SafeCare',35.00,75,'2028-02-28'),
(9,'Digestive Enzyme','Digestive Care','Wellness Co',88.00,15,'2027-07-31'),
(10,'Oral Rehydration Salts','Digestive Care','Wellness Co',18.00,90,'2027-12-31'),
(11,'Hand Sanitizer','Personal Care','PureHands',65.00,40,'2027-05-31'),
(12,'Moisturizing Lotion','Personal Care','DermaCare',145.00,19,'2027-08-31'),
(13,'Calcium Tablets','Vitamins & Supplements','NutriWell',125.00,28,'2027-12-31'),
(14,'Thermometer','First Aid','SafeCare',160.00,12,'2029-01-31'),
(15,'Saline Nasal Spray','Cold & Cough','Care Labs',82.00,16,'2027-04-30'),
(16,'Antacid Tablets','Digestive Care','Wellness Co',42.00,9,'2027-09-30'),
(17,'Pain Relief Gel','Pain Relief','Demo Healthcare',115.00,21,'2027-10-31'),
(18,'Zinc Supplements','Vitamins & Supplements','NutriWell',78.00,34,'2027-12-31'),
(19,'Cotton Roll','First Aid','SafeCare',30.00,50,'2028-03-31'),
(20,'Gentle Skin Cleanser','Personal Care','DermaCare',210.00,11,'2027-11-30');

INSERT IGNORE INTO orders(order_id,user_id,order_date,total_amount,status) VALUES
(1,2,'2026-10-20',50.00,'Delivered'),
(2,3,'2026-10-22',95.00,'Shipped'),
(3,4,'2026-10-25',185.00,'Processing'),
(4,2,'2026-10-28',110.00,'Confirmed'),
(5,3,'2026-11-01',72.00,'Pending');
INSERT IGNORE INTO order_items(item_id,order_id,medicine_id,quantity,price) VALUES
(1,1,1,2,25.00),(2,2,3,1,95.00),(3,3,6,1,185.00),
(4,4,5,1,110.00),(5,5,7,1,72.00),(6,1,10,1,18.00),
(7,2,4,2,22.00),(8,3,8,1,35.00),(9,4,18,1,78.00),
(10,5,19,2,30.00);
