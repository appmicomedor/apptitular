CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `contador_fallos` int(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`username`);

ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

CREATE TABLE `historial` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,    
  `childId` int(11) DEFAULT NULL,  
  `date` datetime NOT NULL, 
  `createdAt` datetime NOT NULL, 
  `value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `historial`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `historial` ADD COLUMN `titular` varchar(512) DEFAULT NULL;
ALTER TABLE `historial` ADD COLUMN `tipo` int(1) DEFAULT 0;
