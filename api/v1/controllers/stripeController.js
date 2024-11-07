const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Make sure to import jwt
const User = require('../models/UserModel'); // Adjust the path to your user model
const Device = require('../models/DeviceModel');
const Token = require('../models/TokenModel'); // Adjust the path as necessary
const Shop = require('../models/ShopModel'); // Adjust the path as necessary
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getCountryCode, getCountryCurrency }= require('../middleware/countryMiddleware')
dotenv.config();
const stripe = require("stripe")(
    // This is your test secret API key.
    process.env.STRIPE_TEST_SECRET,
    {
      apiVersion: process.env.STRIPE_API_VERSION,
    }
  );
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const URL = process.env.HEROKU_URL;

// Add Shop Details
const addStripeAccount = async (req, res) => {
    try {


        // Get the user's IP address
        let userIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

        // If the IP address is in IPv6 format, convert it to IPv4
        if (userIp.startsWith('::ffff:')) {
            userIp = userIp.replace('::ffff:', '');
        }

        console.log('User IP:', userIp);

        const userId = req.params.userId;
        const userDetails = await User.findById({_id: userId});
        const shopDetails = await Shop.find({ userId: userId })
        const epochTimestamp = Math.floor(Date.now() / 1000);
        const account = await stripe.accounts.create({
            country: getCountryCode(shopDetails[0].contactInfo.address.country),  // Shop's country (UK for this example)
            email: userDetails.auth.email, // Shop owner's email
            business_type: 'company', // Business type (company in this case)
            company: {
                name: shopDetails[0].businessName, // Business name
                phone: shopDetails[0].contactInfo.phone,
                registration_number: shopDetails[0].companyhouseregistrationNumber,
                address: {
                    line1: shopDetails[0].contactInfo.address.street,
                    line2: '',
                    city: shopDetails[0].contactInfo.address.city,
                    postal_code: shopDetails[0].contactInfo.address.postcode,
                    state: '',
                    country: getCountryCode(shopDetails[0].contactInfo.address.country), // Use 2-letter country code (GB for UK)
                },
                directors_provided: true,
                executives_provided: false,
                owners_provided: true,
                // ownership_declaration: {
                //     date: epochTimestamp,
                //     ip: userIp,
                //     user_agent: 'Mozilla/5.0',
                // },
                structure: '',
                tax_id: shopDetails[0].companyhouseregistrationNumber,
                vat_id: shopDetails[0].vatNumber,
                verification: {
                    document:{
                        front: '',
                        back: '',
                    },
                },
            },
            business_profile: {
                mcc: shopDetails[0].mcc,
                name: shopDetails[0].tradingName, // Trading name (or business name if no trading name)
                product_description: 'Retail shop selling goods using +Pay', // Short description of the business
                url: '', // Shop website URL
            },
            default_currency: getCountryCurrency(shopDetails[0].contactInfo.address.country),
            // individual:{
            //     first_name: userDetails.firstName,
            //     last_name: userDetails.lastName,
            //     email: userDetails.auth.email,
            //     gender: '',
            //     id_number: '',
            //     dob:{
            //         day: '21',
            //         month: '08',
            //         year: '1993',
            //     },
            //     address: {
            //         line1: shopDetails[0].contactInfo.address.street,
            //         line2: '',
            //         city: shopDetails[0].contactInfo.address.city,
            //         postal_code: shopDetails[0].contactInfo.address.postcode,
            //         state: '',
            //         country: getCountryCode(shopDetails[0].contactInfo.address.country) // Use 2-letter country code (GB for UK)
            //     },
            //     registered_address: {
            //         line1: shopDetails[0].contactInfo.address.street,
            //         line2: '',
            //         city: shopDetails[0].contactInfo.address.city,
            //         postal_code: shopDetails[0].contactInfo.address.postcode,
            //         state: '',
            //     },
            //     political_exposure: '',
            //     relationship: {
            //         director: true,
            //         executive: false,
            //         owner: true,
            //         percent_ownership: 'full',
            //         title: 'CEO',
            //     },
            //     verification: {
            //         document: {
            //             front: '',
            //             back: '',
            //         },
            //         additional_document: {
            //             front: '',
            //             back: '',
            //         },
            //     },
            //     tos_acceptance: {
            //         date: epochTimestamp,
            //         ip: userIp,
            //         user_agent: 'Mozilla/5.0',
            //     },
            // },
            documents: {
                bank_account_ownership_verification: {
                    files: [],
                },
                company_license: {
                    files: [],
                },
                company_registration_verification: {
                    files: [],
                },
                company_tax_id_verification: {
                    files: [],
                },
                proof_of_registration: {
                    files: [],
                },
            },
            // external_account: {
            //     account_number: '1234567890',
            //     account_holder_name: `${userDetails.firstName} ${userDetails.last_name}`,
            //     account_holder_type: 'company',
            //     country: getCountryCode(shopDetails[0].contactInfo.address.country),
            //     currency: getCountryCurrency(shopDetails[0].contactInfo.address.country),
            //     object: 'bank_account',
            //     documents: {
            //         bank_account_ownership_verification: {
            //             files: [],
            //         },
            //     },
            //     routing_number: '102030',
            // },
            capabilities: {
                bank_transfer_payments: { requested: true },
                card_payments: { requested: true }, // Request card payment capability
                transfers: { requested: true }, // Request transfer capability for payouts
            },
            settings: {
                payouts: {
                    debit_negative_balances: true,
                    schedule: {
                        delay_days: 'minimum',
                        interval: 'daily' // Daily payout schedule
                    }
                },
                // branding: {
                //     icon: 'icon',
                //     logo: 'logo',
                //     primary_color: '#FFFFFF',
                //     secondary_color: '#FFFFFF',
                // },
            },
            controller: {
                fees: {
                    payer: 'application' // Application (your platform) covers Stripe fees
                },
                losses: {
                    payments: 'application' // Application (your platform) handles payment losses
                },
                requirement_collection: 'application', // You (Plus Equals To) handle requirement collection
                stripe_dashboard: {
                    type: 'none' // No access to the Stripe Dashboard for the shop
                },
            },
            tos_acceptance: {
                date: epochTimestamp,
                ip: userIp,
                user_agent: 'Mozilla/5.0',
            },
        });
        console.log(account);
        shopDetails[0].stripeAccountId = account.id;
        shopDetails[0].save();

        const person = await stripe.accounts.createPerson(
            shopDetails[0].stripeAccountId,
            {
                first_name: userDetails.firstName,
                last_name: userDetails.lastName,
                email: userDetails.auth.email,
                nationality: getCountryCode(userDetails[0].contactInfo.address.country),
                phone: '',
                gender: '',
                id_number: '1234567',
                dob:{
                    day: '21',
                    month: '08',
                    year: '1993',
                },
                address: {
                    line1: '',
                    line2: '',
                    city: '',
                    postal_code: '',
                    state: '',
                    country: '', // Use 2-letter country code (GB for UK)
                },
                relationship: {
                    director: true,
                    executive: true,
                    legal_guardian: false,
                    owner: true,
                    percent_ownership: 100.0,
                    representative: true,
                    title: 'CEO',
                },
                // additional_tos_acceptances: {
                //     account: {
                //         date: epochTimestamp,
                //         ip: userIp,
                //         user_agent: 'Mozilla/5.0',
                //     },
                // },
                registered_address: {
                    line1: '',
                    line2: '',
                    city: '',
                    postal_code: '',
                    state: '',
                    country: '', // Use 2-letter country code (GB for UK)
                },
                verification: {
                    document: {
                        front: '',
                        back: '',
                    },
                    additional_document: {
                        front: '',
                        back: '',
                    },
                }, 
            }
        );
        console.log(person);
        const update = await stripe.accounts.update(
            shopDetails[0].stripeAccountId,
            {
                company: {
                    directors_provided: true,
                    executives_provided: false,
                    owners_provided: true,
                    ownership_declaration: {
                        date: epochTimestamp,
                        ip: userIp,
                        user_agent: 'Mozilla/5.0',
                    },
                },
            }
        );
        console.log(update);
        return res.status(201).json({
            status: 201,
            message: 'Stripe connected account created successfully.',
            account: account.id,
            person: person.id,
            update: update.date,
        });
      } catch (error) {
        console.error(
            "An error occurred when calling the Stripe API to create an account",
            error
        );
        res.status(500);
        res.send({ error: error.message });
    }
};

// Delete Shop Details
const getStripeAccount = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        const shopDetails = await Shop.find({ userId: userId })
        const account = await stripe.accounts.retrieve(shopDetails[0].stripeAccountId);
        console.log(account.payouts_enabled);

        shopDetails[0].verified = account.payouts_enabled;
        shopDetails[0].save();

        return res.status(201).json({
            status: 201,
            message: 'Stripe connected account retrived successfully.',
            account: account,
        });
      } catch (error) {
        console.error(
            "An error occurred when calling the Stripe API to create an account",
            error
        );
        res.status(500);
        res.send({ error: error.message });
    }
};

const updateStripeAccount = async (req, res) => {
    try {
      const stripeAccountId = req.params.account;
  
      const account = await stripe.accounts.update(
        stripeAccountId,
        {
            business_type: 'company',
        },
      );

      res.json({
        account: account.id,
      });
    } catch (error) {
        console.error(
            "An error occurred when calling the Stripe API to update an account",
            error
        );
        res.status(500);
        res.send({ error: error.message });
    }
};

// Delete Shop Details
const deleteStripeAccount = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        const shopDetails = await Shop.find({ userId: userId })
        const deleted = await stripe.accounts.del(shopDetails[0].stripeAccountId);
        return res.status(201).json({
            status: 201,
            message: 'Stripe connected account deleted successfully.',
            account: deleted,
        });
      } catch (error) {
        console.error(
            "An error occurred when calling the Stripe API to create an account",
            error
        );
        res.status(500);
        res.send({ error: error.message });
    }
};

module.exports = {
    addStripeAccount,
    getStripeAccount,
    updateStripeAccount,
    deleteStripeAccount,
};