import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IFamilyService } from '../services/interfaces/IFamilyService';
import { CreateFamilyDto, UpdateFamilyDto, FamilyParamsDto } from '../shared/dtos/family.dto';

@injectable()
export class FamilyController {
  constructor(
    @inject('FamilyService')
    private familyService: IFamilyService
  ) { }

  async create(req: Request<{}, {}, CreateFamilyDto>, res: Response) {
    try {

      const name = req.body.name;
      const family = await this.familyService.create({
        name
      });

      res.status(201).json({
        success: true,
        message: 'Família criada com sucesso',
        data: family
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<FamilyParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const family = await this.familyService.findById(id);

      res.json({
        success: true,
        data: family
      });
    } catch (error) {
      throw error;
    }
  }

  async findByIdWithUsers(req: Request<FamilyParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const family = await this.familyService.findByIdWithUsers(id);

      res.json({
        success: true,
        data: family
      });
    } catch (error) {
      throw error;
    }
  }

  async findByIdWithAccounts(req: Request<FamilyParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const family = await this.familyService.findByIdWithAccounts(id);

      res.json({
        success: true,
        data: family
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const families = await this.familyService.findAll();

      res.json({
        success: true,
        data: families
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<FamilyParamsDto, {}, UpdateFamilyDto>, res: Response) {
    try {
      const { id } = req.params;
      const name = req.body.name;
      const family = await this.familyService.update(id, {
        name
      });

      res.json({
        success: true,
        message: 'Família atualizada com sucesso',
        data: family
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request<FamilyParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.familyService.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
