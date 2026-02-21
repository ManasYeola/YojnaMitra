import { Request, Response } from 'express';
import WhatsAppSession from '../models/WhatsAppSession';
import eligibilityEngine from '../services/eligibilityEngine';
import {
  STATES,
  OCCUPATION_TYPES,
  LAND_OWNERSHIP,
  AGE_RANGES,
  CASTE_CATEGORIES,
  INCOME_RANGES,
  BPL_OPTIONS,
  SPECIAL_CATEGORIES,
  MESSAGES,
} from '../config/whatsapp.config';

/**
 * WhatsApp Webhook Controller
 * Handles incoming messages from Twilio WhatsApp Sandbox
 */
export class WhatsAppController {
  /**
   * Main webhook handler - receives all incoming WhatsApp messages
   */
  async handleIncomingMessage(req: Request, res: Response): Promise<void> {
    try {
      const incomingMessage = req.body.Body?.trim().toLowerCase();
      const phoneNumber = req.body.From; // Format: whatsapp:+919876543210

      console.log(`📱 WhatsApp message from ${phoneNumber}: ${incomingMessage}`);

      if (!incomingMessage || !phoneNumber) {
        this.sendTwiMLResponse(res, MESSAGES.ERROR);
        return;
      }

      // Handle restart command
      if (incomingMessage === 'restart' || incomingMessage === 'reset') {
        await WhatsAppSession.findOneAndDelete({ phoneNumber });
        this.sendTwiMLResponse(res, MESSAGES.RESTART + '\n\n' + MESSAGES.GREETING);
        return;
      }

      // Get or create session
      let session = await WhatsAppSession.findOne({ phoneNumber });

      if (!session) {
        // New conversation - create session and send greeting
        session = await WhatsAppSession.create({
          phoneNumber,
          stage: 'state',
        });
        this.sendTwiMLResponse(res, MESSAGES.GREETING);
        return;
      }

      // Update last activity
      session.lastActivity = new Date();

      // Process message based on current stage
      await this.processStage(session, incomingMessage, res);
    } catch (error) {
      console.error('Error in handleIncomingMessage:', error);
      this.sendTwiMLResponse(res, MESSAGES.ERROR);
    }
  }

  /**
   * Process message based on conversation stage
   */
  private async processStage(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    switch (session.stage) {
      case 'state':
        await this.handleStateSelection(session, message, res);
        break;

      case 'occupation':
        await this.handleOccupationSelection(session, message, res);
        break;

      case 'landOwnership':
        await this.handleLandOwnershipSelection(session, message, res);
        break;

      case 'age':
        await this.handleAgeSelection(session, message, res);
        break;

      case 'caste':
        await this.handleCasteSelection(session, message, res);
        break;

      case 'income':
        await this.handleIncomeSelection(session, message, res);
        break;

      case 'bpl':
        await this.handleBPLSelection(session, message, res);
        break;

      case 'specialCategory':
        await this.handleSpecialCategorySelection(session, message, res);
        break;

      case 'done':
        // Conversation complete - restart
        this.sendTwiMLResponse(res, 'Type *restart* to search for schemes again.');
        break;

      default:
        this.sendTwiMLResponse(res, MESSAGES.ERROR);
    }
  }

  /**
   * Handle state selection (Stage 1)
   */
  private async handleStateSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > STATES.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.GREETING);
      return;
    }

    const selectedState = STATES[selection - 1];
    session.state = selectedState.value;
    session.stage = 'occupation';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedState.name}*\n\n${MESSAGES.OCCUPATION}`
    );
  }

  /**
   * Handle occupation type selection (Stage 2)
   */
  private async handleOccupationSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > OCCUPATION_TYPES.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.OCCUPATION);
      return;
    }

    const selectedOccupation = OCCUPATION_TYPES[selection - 1];
    session.occupationType = selectedOccupation.value;
    session.stage = 'landOwnership';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedOccupation.name}*\n\n${MESSAGES.LAND_OWNERSHIP}`
    );
  }

  /**
   * Handle land ownership selection (Stage 3)
   */
  private async handleLandOwnershipSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > LAND_OWNERSHIP.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.LAND_OWNERSHIP);
      return;
    }

    const selectedLandOwnership = LAND_OWNERSHIP[selection - 1];
    session.landOwnership = selectedLandOwnership.value;
    session.stage = 'age';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedLandOwnership.name}*\n\n${MESSAGES.AGE}`
    );
  }

  /**
   * Handle age selection (Stage 4)
   */
  private async handleAgeSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > AGE_RANGES.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.AGE);
      return;
    }

    const selectedAge = AGE_RANGES[selection - 1];
    session.age = selectedAge.value;
    session.stage = 'caste';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedAge.name}*\n\n${MESSAGES.CASTE}`
    );
  }

  /**
   * Handle caste category selection (Stage 5)
   */
  private async handleCasteSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > CASTE_CATEGORIES.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.CASTE);
      return;
    }

    const selectedCaste = CASTE_CATEGORIES[selection - 1];
    session.casteCategory = selectedCaste.value;
    session.stage = 'income';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedCaste.name}*\n\n${MESSAGES.INCOME}`
    );
  }

  /**
   * Handle income selection (Stage 6)
   */
  private async handleIncomeSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > INCOME_RANGES.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.INCOME);
      return;
    }

    const selectedIncome = INCOME_RANGES[selection - 1];
    session.income = selectedIncome.value;
    session.stage = 'bpl';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedIncome.name}*\n\n${MESSAGES.BPL}`
    );
  }

  /**
   * Handle BPL card selection (Stage 7)
   */
  private async handleBPLSelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selection = parseInt(message);

    if (isNaN(selection) || selection < 1 || selection > BPL_OPTIONS.length) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.BPL);
      return;
    }

    const selectedBPL = BPL_OPTIONS[selection - 1];
    session.bplCard = selectedBPL.value;
    session.stage = 'specialCategory';
    await session.save();

    this.sendTwiMLResponse(
      res,
      `✅ Selected: *${selectedBPL.name}*\n\n${MESSAGES.SPECIAL_CATEGORY}`
    );
  }

  /**
   * Handle special category selection (Stage 8) and trigger eligibility matching
   */
  private async handleSpecialCategorySelection(
    session: any,
    message: string,
    res: Response
  ): Promise<void> {
    const selections = message.split(',').map((s) => parseInt(s.trim()));

    // Validate input
    if (selections.some((s) => isNaN(s) || s < 1 || s > SPECIAL_CATEGORIES.length)) {
      this.sendTwiMLResponse(res, MESSAGES.INVALID_INPUT + '\n\n' + MESSAGES.SPECIAL_CATEGORY);
      return;
    }

    const selectedCategories = selections.map((s) => SPECIAL_CATEGORIES[s - 1].value);
    session.specialCategories = selectedCategories;
    session.stage = 'done';
    await session.save();

    // Find matching schemes
    try {
      const matchedSchemes = await eligibilityEngine.findMatchingSchemes({
        state: session.state,
        occupationType: session.occupationType,
        landOwnership: session.landOwnership,
        age: session.age,
        casteCategory: session.casteCategory,
        income: session.income,
        bplCard: session.bplCard,
        specialCategories: session.specialCategories,
      });

      if (matchedSchemes.length === 0) {
        this.sendTwiMLResponse(res, MESSAGES.NO_SCHEMES);
        return;
      }

      const formattedMessage = eligibilityEngine.formatSchemesForWhatsApp(matchedSchemes);
      this.sendTwiMLResponse(res, formattedMessage);
    } catch (error) {
      console.error('Error finding schemes:', error);
      this.sendTwiMLResponse(res, MESSAGES.ERROR);
    }
  }

  /**
   * Send TwiML response to WhatsApp
   */
  private sendTwiMLResponse(res: Response, message: string): void {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${this.escapeXml(message)}</Message>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Health check endpoint
   */
  healthCheck(_req: Request, res: Response): void {
    res.json({
      success: true,
      message: 'WhatsApp webhook is active',
      timestamp: new Date().toISOString(),
    });
  }
}

export default new WhatsAppController();
