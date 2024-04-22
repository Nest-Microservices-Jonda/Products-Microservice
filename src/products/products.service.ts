import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  public async create(createProductDto: CreateProductDto) {
    return await this.product.create({ data: createProductDto });
  }

  public async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const count = await this.product.count({ where: { available: true } });

    const lastPage = Math.ceil(count / limit);

    const data = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { available: true },
    });

    return {
      data,
      meta: {
        count,
        page,
        lastPage,
      },
    };
  }

  public async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  public async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;
    return await this.product.update({ where: { id }, data: data });
  }

  public async remove(id: number) {
    // return await this.product.delete({ where: { id } });
    return await this.product.update({
      where: { id },
      data: { available: false },
    });
  }
}
