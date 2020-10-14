const express = require('express');
// const authRequired = require('../middleware/authRequired');
const Orders = require('./orderModel');
const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Order:
 *      type: object
 *      required:
 *        - organizationName
 *        - contactName
 *        - soapBarNum
 *        - contactPhone
 *        - contactEmail
 *        - country
 *        - beneficiariesNum
 *        - hygieneInitiative
 *      properties:
 *        organizationName:
 *          type: string
 *        organizationWebsite:
 *          type: string
 *        contactName:
 *          type: string
 *        soapBarNum:
 *          type: integer
 *        contactPhone:
 *          type: string
 *        contactEmail:
 *          type: string
 *          description: Maximum 320 characters
 *        address:
 *          type: string
 *        country:
 *          type: string
 *        beneficiariesNum:
 *          type: integer
 *        hygieneSituation:
 *          type: string
 *        hygieneInitiative:
 *          type: string
 *        comments:
 *          type: string
 *        buyerId:
 *          type: integer
 *      example:
 *        id: 55
 *        organizationName: 'test'
 *        organizationWebsite: 'test@example.com'
 *        contactName: "test"
 *        soapBarNum: 2
 *        contactPhone: "5555555555"
 *        contactEmail: "contact@test.com"
 *        address: null
 *        country: "USA"
 *        beneficiariesNum: 2
 *        hygieneSituation: null
 *        hygieneInitiative: "test"
 *        comments: null
 *        created_at: "2020-10-13T21:56:51.877Z"
 *        updated_at: "2020-10-13T21:56:51.877Z"
 *        buyerId: null
 *
 * /orders:
 *  get:
 *    description: Returns a list of orders
 *    summary: Get a list of all orders
 *    security:
 *      - okta: []
 *    tags:
 *      - order
 *    responses:
 *      200:
 *        description: array of orders
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Order'
 *              example:
 *                - organizationName: "test"
 *                  organizationWebsite: "www.testorganization.com"
 *                  contactName: "test contact"
 *                  soapBarNum: 10
 *                  contactPhone: "5555555555"
 *                  contactEmail: "contact@test.com"
 *                  address: null
 *                  country: "USA"
 *                  beneficiariesNum: 180
 *                  hygieneSituation: null
 *                  hygieneInitiative: "distribution of soap in rural villages"
 *                  comments: null
 *                  buyerId: null
 */

// GET all orders
router.get('/', function (req, res) {
  Orders.getAllOrders()
    .then((orders) => {
      res.status(200).json(orders);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err.message });
    });
});

/**
 * @swagger
 * components:
 *  parameters:
 *    orderId:
 *      name: id
 *      in: path
 *      description: ID of the order to return
 *      required: true
 *      example: 55
 *      schema:
 *        type: integer
 *
 * /orders/{id}:
 *  get:
 *    description: Find orders by ID
 *    summary: Returns a single order
 *    security:
 *      - okta: []
 *    tags:
 *      - order
 *    parameters:
 *      - $ref: '#/components/parameters/orderId'
 *    responses:
 *      200:
 *        description: A order object
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Order'
 *      404:
 *        description: 'Order not found'
 */

// GET specific order by id
router.get('/:id', function (req, res) {
  const id = String(req.params.id);
  Orders.getOrderById(id)
    .then((order) => {
      if (order) {
        res.status(200).json(order);
      } else {
        res.status(404).json({ error: 'Order Not Found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

/**
 * @swagger
 * /orders:
 *  post:
 *    summary: Add a order
 *    security:
 *      - okta: []
 *    tags:
 *      - order
 *    requestBody:
 *      description: Order object to to be added
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Order'
 *    responses:
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        description: 'Order not found'
 *      200:
 *        description: A order object
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: A message about the result
 *                  example: order created
 *                order:
 *                  $ref: '#/components/schemas/Order'
 */

// POST order
router.post('/', validateOrder, (req, res) => {
  const order = req.body;

  Orders.createOrder(order)
    .then((newOrder) => {
      res.status(200).json(newOrder);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Error creating that order', err });
    });
});

/**
 * @swagger
 * /order/{id}:
 *  delete:
 *    summary: Remove a order
 *    security:
 *      - okta: []
 *    tags:
 *      - order
 *    parameters:
 *      - $ref: '#/components/parameters/orderId'
 *    responses:
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        $ref: '#/components/responses/NotFound'
 *      200:
 *        description: A order object
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: A message about the result
 *                  example: order 55 was deleted.
 *                profile:
 *                  $ref: '#/components/schemas/Order'
 */

// DELETE order by id
router.delete('/:id', (req, res) => {
  Orders.deleteOrder(req.params.id)
    .then((order) => {
      if (order) {
        res.status(200).json({ deleted: order });
      } else {
        res.status(404).json({ message: 'Order Not Found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: 'error deleting that order', err });
    });
});

/**
 * @swagger
 * /orders:
 *  put:
 *    summary: Update a order
 *    security:
 *      - okta: []
 *    tags:
 *      - order
 *    requestBody:
 *      description: Order object to to be updated
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Order'
 *    responses:
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      404:
 *        $ref: '#/components/responses/NotFound'
 *      200:
 *        description: A order object
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: A message about the result
 *                  example: order created
 *                profile:
 *                  $ref: '#/components/schemas/Order'
 */

// EDIT order by id
router.put('/:id', validateOrder, (req, res) => {
  Orders.getOrderById(req.params.id)
    .then((order) => {
      if (order) {
        Orders.editOrder(req.body, req.params.id)
          .then((update) => {
            res.status(200).json(update);
          })
          .catch((err) => {
            res.status(500).json({ error: 'error updating that order', err });
          });
      } else {
        res.status(404).json({ message: 'Order Not Found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: 'issue editing that order', err });
    });
});

// -----------------  custom middleware   ----------------------------

function validateOrder(req, res, next) {
  const order = req.body;

  if (order) {
    if (order.contactEmail && order.contactEmail.length < 321) {
      if (
        order.organizationName &&
        order.organizationWebsite &&
        order.contactName &&
        order.soapBarNum &&
        order.contactPhone &&
        order.country &&
        order.beneficiariesNum &&
        order.hygieneInitiative
      ) {
        next();
      } else {
        res
          .status(404)
          .json({ message: 'Please provide required information' });
      }
    } else {
      res
        .status(404)
        .json({ message: 'Email is required and max 320 characters' });
    }
  } else {
    res.status(404).json({ message: 'Order missing' });
  }
}

module.exports = router;
