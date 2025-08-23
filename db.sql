CREATE TABLE
	users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		firstName VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(firstName) >= 3),
		lastName VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(lastName) >= 3),
		email VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		birthDate NOT NULL DATE,
		isEmailConfirmed BOOLEAN NOT NULL DEFAULT FALSE,
		emailConfirmationToken NULL VARCHAR(255),
		passwordLastUpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		passwordResetToken VARCHAR(255) NULL DEFAULT '',
		passwordResetTokenExpiresAt NULL DATETIME,
		isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
		isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
		createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

INSERT INTO
	ecom.users (
		firstName,
		lastName,
		email,
		password,
		birthDate,
		isEmailConfirmed,
		emailConfirmationToken,
		passwordLastUpdatedAt,
		passwordResetToken,
		passwordResetTokenExpiresAt,
		isAdmin,
		createdAt,
		isDeleted
	)
VALUES
	(
		'John',
		'Smith',
		'john.smith@example.com',
		'$2b$12$iPS5LOOVlvNkUfFEwMLsIu79rYsyql5kj9Ui5u9GkJwx0Dw0c8aFi',
		'1995-07-21',
		0,
		'abc123confirmationtoken',
		'2025-08-16 09:36:08',
		'',
		'2025-08-31 23:59:59',
		0,
		'2025-08-16 09:36:08',
		1
	),
	(
		'Alice',
		'Brown',
		'alice.brown@example.com',
		'$2b$10$V1OePQWZHVjB3K6O4G6yXOIbbvjD8FG4IYwMZfXgqgMKoYVt6kKau',
		'1990-11-05',
		1,
		NULL,
		'2025-08-16 09:36:08',
		'',
		NULL,
		1,
		'2025-08-16 09:36:08',
		0
	),
	(
		'Michael',
		'Anderson',
		'michael.anderson@example.com',
		'$2b$10$JpQkpBf3JpDgZpBpXv2uYuIyfJwHRFfRzQ3gHt3OZ9czdl0FEXO9O',
		'2000-02-15',
		0,
		'tokenXYZ987',
		'2025-08-16 09:36:08',
		'',
		'2025-12-31 23:59:59',
		1,
		'2025-08-16 09:36:08',
		0
	),
	(
		'Emma',
		'Johnson',
		'emma.johnson@example.com',
		'$2b$10$8v2L3PKxDROV3N/jlQhbVeRJcC4UOxFj3W6Y8MPoGZJt6F7G/y2Y6',
		'1998-06-10',
		1,
		NULL,
		'2025-08-16 09:36:08',
		'',
		NULL,
		0,
		'2025-08-16 09:36:08',
		0
	),
	(
		'John',
		'Doe',
		'john.doe@example.com',
		'$2b$10$MsIBN3eeWmsEQ8Rt1jG92uIe.uGqhwJc0zUngaKxWxuYbDi.g/uV6',
		'1990-01-01',
		0,
		'$2b$10$kDmGOefQdf7F4B40WfBilOlngwA9oCJXN.GQrgS/wN9JZtEY5xr1m',
		'2025-08-16 20:17:29',
		'',
		NULL,
		0,
		'2025-08-16 20:38:01',
		0
	);

ALTER TABLE users 
MODIFY passwordResetTokenExpiresAt DATETIME NULL DEFAULT NULL;
ALTER TABLE users 
MODIFY passwordResetToken VARCHAR(255) NULL DEFAULT NULL;

SELECT * FROM users WHERE email = ?;

-- products
CREATE TABLE
	products (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		price DECIMAL(7, 2) NOT NULL,
		discount DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
		description TEXT,
		withNursery BOOLEAN NOT NULL DEFAULT FALSE,
		amountOfSmallSize INT NOT NULL DEFAULT 0,
		amountOfLargeSize INT NOT NULL DEFAULT 0,
		isDeleted TINYINT (1) NOT NULL DEFAULT 0
	);

INSERT INTO
	products (
		name,
		price,
		discount,
		description,
		withNursery,
		amountOfSmallSize,
		amountOfLargeSize,
		isDeleted
	)
VALUES
	(
		'Monstera Deliciosa',
		34.99,
		0.15,
		'Swiss cheese plant with iconic split leaves',
		TRUE,
		12,
		8,
		0
	),
	(
		'Snake Plant',
		22.50,
		0.00,
		'Low-light tolerant air purifying succulent',
		FALSE,
		25,
		15,
		0
	),
	(
		'Fiddle Leaf Fig',
		89.99,
		0.20,
		'Trendy tree with large violin-shaped leaves',
		TRUE,
		5,
		18,
		0
	),
	(
		'Pothos Golden',
		12.99,
		0.10,
		'Easy-care trailing vine with heart-shaped leaves',
		FALSE,
		40,
		5,
		0
	),
	(
		'ZZ Plant',
		29.75,
		0.00,
		'Nearly indestructible drought-tolerant plant',
		TRUE,
		18,
		12,
		1
	),
	(
		'Peace Lily',
		27.50,
		0.25,
		'White flower-producing air purifier',
		TRUE,
		15,
		22,
		0
	),
	(
		'Aloe Vera',
		8.99,
		0.05,
		'Medicinal succulent with cooling gel',
		FALSE,
		50,
		3,
		0
	),
	(
		'Bird of Paradise',
		120.00,
		0.00,
		'Tropical plant with dramatic banana-like leaves',
		TRUE,
		3,
		14,
		0
	),
	(
		'Spider Plant',
		10.49,
		0.30,
		'Architectural plant with variegated grass-like leaves',
		FALSE,
		60,
		8,
		0
	),
	(
		'Rubber Plant',
		45.25,
		0.15,
		'Burgundy foliage perfect for bright spaces',
		TRUE,
		7,
		9,
		1
	);


-- 1. Add nullable column
ALTER TABLE products ADD COLUMN createdAt DATETIME NULL;

-- 2. Fill existing records with random times (Jan 1 - now)
UPDATE products SET createdAt = FROM_UNIXTIME(
    UNIX_TIMESTAMP('2023-01-01') + 
    RAND() * (UNIX_TIMESTAMP() - UNIX_TIMESTAMP('2023-01-01'))
);

-- 3. Set as NOT NULL with default
ALTER TABLE products 
MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- images
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO images (productId, fileName) VALUES
(1, 'product-2-1.jpg'),
(1, 'product-4-2.jpg'),

(2, 'product-5-2.jpg'),
(2, 'product-3-2.jpg'),

(3, 'product-2-1.jpg'),
(3, 'product-5-2.jpg'),

(4, 'product-4-2.jpg'),

(5, 'product-3-2.jpg'),
(5, 'product-2-1.jpg'),

(6, 'product-4-2.jpg'),

(7, 'product-5-2.jpg'),
(7, 'product-3-2.jpg'),

(8, 'product-2-1.jpg'),

(9, 'product-4-2.jpg'),
(9, 'product-5-2.jpg'),

(10, 'product-3-2.jpg'),

(11, 'product-2-1.jpg'),
(11, 'product-4-2.jpg');

-- carts

CREATE TABLE carts (
    userId INT NOT NULL,
    productId INT NOT NULL,
    smallQuantity INT NOT NULL DEFAULT 0,
    largeQuantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);

INSERT INTO carts (userId, productId, smallQuantity, largeQuantity)
SELECT u.userId, p.productId, FLOOR(1 + (RAND() * 5)) AS smallQuantity, FLOOR(1 + (RAND() * 5)) AS largeQuantity
FROM (
    SELECT 1 AS userId UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10
) AS u
JOIN (
    SELECT 1 AS productId UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) AS p
ORDER BY RAND()
LIMIT 30;


-- wishlists

CREATE TABLE wishlists (
    userId INT NOT NULL,
    productId INT NOT NULL,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);

INSERT INTO wishlists (userId, productId)
SELECT u.userId, p.productId
FROM (
    SELECT 1 AS userId UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10
) AS u
JOIN (
    SELECT 1 AS productId UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) AS p
ORDER BY RAND()
LIMIT 30;


-- shipmentCosts
DROP TABLE IF EXISTS shipmentCosts;
CREATE TABLE shipmentCosts (
  government VARCHAR(100) PRIMARY KEY,
  cost DECIMAL(6,2)    NOT NULL
);

INSERT INTO shipmentCosts (government, cost) VALUES
  ('Alexandria',      60.00),
  ('Aswan',           80.00),
  ('Assiut',          80.00),
  ('Beheira',         55.00),
  ('Beni Suef',       65.00),
  ('Cairo',           50.00),
  ('Dakahlia',        30.00),
  ('Damietta',        45.00),
  ('Fayoum',          40.00),
  ('Gharbia',         35.00),
  ('Giza',            40.00),
  ('Ismailia',        48.00),
  ('Kafr El Sheikh',  42.00),
  ('Luxor',           90.00),
  ('Matrouh',         75.00),
  ('Minya',           65.00),
  ('Monufia',         33.00),
  ('New Valley',     120.00),
  ('North Sinai',    110.00),
  ('Port Said',       70.00),
  ('Qalyubia',        35.00),
  ('Qena',            85.00),
  ('Red Sea',        130.00),
  ('Sharqia',         45.00),
  ('Sohag',           75.00),
  ('South Sinai',    140.00),
  ('Suez',            95.00);



-- orders
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  trackCode VARCHAR(50) NULL UNIQUE,
  government VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  secondPhoneNumber VARCHAR(20),
  status ENUM('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes TEXT DEFAULT NULL,
  zipCode VARCHAR(20),
  shipmentCost DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_orders_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO orders (id, userId, trackCode, government, city, address, phoneNumber, secondPhoneNumber, status, notes, zipCode, shipmentCost)
VALUES
  (1,  1, 'TRK-0001', 'Cairo',      'Nasr City',  '12 Abbas El Akkad St.',                       '01001234567', '01122334455', 'Pending',    'Leave with doorman', '11765', (SELECT cost FROM shipmentCosts WHERE government = 'Cairo' LIMIT 1)),
  (2,  2, 'TRK-0002', 'Giza',       'Dokki',      '45 Tahrir St.',                               '01007654321', NULL,           'Processing', NULL,                 '12611', (SELECT cost FROM shipmentCosts WHERE government = 'Giza' LIMIT 1)),
  (3,  3, 'TRK-0003', 'Alexandria', 'Smouha',     '23 El Horreya Rd.',                           '01234567890', '01555555555', 'Shipped',    'Call before delivery', '21532', (SELECT cost FROM shipmentCosts WHERE government = 'Alexandria' LIMIT 1)),
  (4,  4, 'TRK-0004', 'Dakahlia',   'Mansoura',   'El Gomhoria St., near Faculty of Medicine',  '01099887766', NULL,           'Delivered',  NULL,                 '35511', (SELECT cost FROM shipmentCosts WHERE government = 'Dakahlia' LIMIT 1)),
  (5,  9, 'TRK-0005', 'Sharqia',    'Zagazig',    'Mostafa Kamel St., 3rd floor',                '01033445566', '01211223344', 'Cancelled',  'Customer requested hold', '44555', (SELECT cost FROM shipmentCosts WHERE government = 'Sharqia' LIMIT 1)),
  (6, 10, 'TRK-0006', 'Qalyubia',   'Shubra',     '5 El-Mansour St.',                            '01055556666', NULL,           'Pending',    NULL,                 '13311', (SELECT cost FROM shipmentCosts WHERE government = 'Qalyubia' LIMIT 1)),
  (7,  1, 'TRK-0007', 'Beheira',    'Damanhour',  'Street 10, Building 4',                       '01144443332', NULL,           'Processing', 'Deliver after 6pm',  '22512', (SELECT cost FROM shipmentCosts WHERE government = 'Beheira' LIMIT 1)),
  (8,  2, 'TRK-0008', 'Minya',      'Minya',      'Al-Mahatta St., apt 2',                       '01077778888', NULL,           'Shipped',    NULL,                 '61513', (SELECT cost FROM shipmentCosts WHERE government = 'Minya' LIMIT 1));


-- items

CREATE TABLE items (
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  pricePerUnit DECIMAL(10,2) NOT NULL,
  size ENUM('small','large') NOT NULL DEFAULT 'small',
  PRIMARY KEY (orderId, productId, size),
  CONSTRAINT fk_items_orders    FOREIGN KEY (orderId)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_items_products  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
);

INSERT INTO items (orderId, productId, quantity, pricePerUnit, size) VALUES
  (1,  1, 2, 199.99, 'small'),
  (1,  3, 1,  49.50, 'large'),
  (2,  2, 1, 129.00, 'small'),
  (3,  5, 3,  39.99, 'small'),
  (3,  7, 1, 349.00, 'large'),
  (4, 11, 1,  89.90, 'large'),
  (5,  4, 2,  59.00, 'small'),
  (6,  6, 1, 159.00, 'small'),
  (7,  8, 4,  25.00, 'small'),
  (8, 10, 1, 499.99, 'large');

-- offers
CREATE TABLE offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(255) NULL DEFAULT NULL,
  subTitle VARCHAR(255) NULL DEFAULT NULL,
  oldPrice DECIMAL(10,2) NOT NULL,
  discount DECIMAL(4,2) NOT NULL,
  endTime TIMESTAMP NOT NULL,
  url VARCHAR(255) NOT NULL
)